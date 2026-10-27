# Modelling Anne’s Possible Locations with IES Possibilia

**How can a knowledge graph say both “Anne might actually have been in Edinburgh” and “Anne might actually have been in Brighton” on the same day — without collapsing into nonsense?**

This tutorial walks through a runnable Rust example that answers that question using [IES Possibilia](https://github.com/IES-Org/ies-possibilia), a preview extension of the UK Government’s Information Exchange Standard (IES). The use case and the design rationale come from Partridge, Mitchell & Cola, [*Digitalizing Uncertain Information*](https://ceur-ws.org/Vol-4175/stids-4.pdf) (STIDS 2024, CEUR-WS Vol-4175).


---

## Introduction

Intelligence systems live on uncertain information. Saying “Anne was in Edinburgh” is not the same as saying “it is possible that Anne was *actually* in Edinburgh.” The STIDS paper opens with exactly that contrast: language already marks the difference, and a digital store should be able to answer queries in a way that respects it — for example, “Could Anne have been in Edinburgh last Saturday?” → “Yes, possibly.” ([§1](https://ceur-ws.org/Vol-4175/stids-4.pdf))

That deceptively simple sentence raises a stack of formal challenges ([§4](https://ceur-ws.org/Vol-4175/stids-4.pdf)):

| Challenge | In plain English |
| --- | --- |
| De re individual modality | Possibility about *this* Anne, not “some person somewhere” |
| Actuality | Possibility that she was *actually* there — not a counterfactual diary rewrite |
| “Inconsistent” knowledge | Edinburgh *and* Brighton are both plausible, yet she cannot be in both |
| Ownership (de se) | *Whose* beliefs are these? |
| Currency (de nunc) | What does the system believe *now*? |
| Modal consistency | Both cities are OK across worlds; both in the *same* world is not |

The paper’s resolution ([§5](https://ceur-ws.org/Vol-4175/stids-4.pdf)) extends BORO/IES with a Lewisian counterpart approach: distinct possible individuals in distinct universes, linked by counterpart sets (*individual possibilities*), and indexed to the system’s *doxastic actualities* — the worlds that, for all the system currently believes, might be its own actual world.

Our running use case is the dual-city form of that story:

1. It is possible that Anne was actually in Edinburgh on Saturday, 30 March 2024.
2. It is possible that Anne was actually in Brighton on Saturday, 30 March 2024.

Classically inconsistent. Modally consistent — once each co-location lives in its own universe.

---

## Step 1 — Imports and identity scaffolding

We pull typed builders from three layers of the stack: `ies-core` (people, places, periods), `ies-top` (states and universes), and `ies-possibilia` (possibilities, actualities, beliefs). A shared IRI base keeps every node in one example namespace. The Saturday is fixed as a UTC midnight timestamp — the day’s `ParticularPeriod` in IES’s four-dimensional style ([§3.4](https://ceur-ws.org/Vol-4175/stids-4.pdf): times are timeslices of the universe).

```rust
use ies_core::classes::{Location, ParticularPeriod, Person};
use ies_core::{IesCoreModelExt, UtcDateTime};
use ies_possibilia::classes::{Actualities, Comcontingents, CurrentMeSign, Possibilities};
use ies_possibilia::prelude::*;
use ies_top::classes::{State, Universe};
use ies_top::IesTopModelExt;
use oxrdf::NamedNode;

const BASE: &str = "http://example.org/ies/anne-locations/";
/// Saturday 30 March 2024 (UTC midnight as the day's ParticularPeriod).
const SAT_30_MAR_2024: &str = "2024-03-30T00:00:00Z";

fn iri(local: &str) -> NamedNode {
    NamedNode::new(format!("{BASE}{local}")).expect("valid IRI")
}
```

---

## Step 2 — Reference data: two cities and one day

Before modality enters, we need the ordinary IES individuals: Edinburgh, Brighton, and the particular period for 30 March 2024. In BORO/IES, “Anne in Edinburgh on that day” will later be a smaller spacetime worm that is part of Anne, part of the city, and part of the day ([§3.4](https://ceur-ws.org/Vol-4175/stids-4.pdf), Figure 1).

```rust
fn main() -> Result<(), Box<dyn std::error::Error>> {
    let mut m = ies_possibilia::model();

    // --- Reference data: cities and the day ---------------------------------
    let edinburgh = m.declare::<Location>(iri("location/Edinburgh"));
    let brighton = m.declare::<Location>(iri("location/Brighton"));
    let sat_30: UtcDateTime = SAT_30_MAR_2024.parse()?;
    let period = m.declare::<ParticularPeriod>(iri("20240330T000000Z"));
    m.iso8601_period_representation(&period, sat_30);
```

---

## Step 3 — Two doxastically actual universes (and two Annes)

Here is the key move against classical inconsistency. We do **not** put one Anne in both cities. We declare two `Universe`s — one for the Edinburgh story, one for Brighton — and two counterpart `Person`s, each `isPartOf` exactly one universe.

That matches the paper’s resolution of modal consistency ([§5.2.3](https://ceur-ws.org/Vol-4175/stids-4.pdf)): Anne is in Edinburgh in *some* of the system’s doxastically actual worlds and in Brighton in *others* — never both in the same world. It also matches the counterpart story for de re modality ([§5.2.1](https://ceur-ws.org/Vol-4175/stids-4.pdf)): different possible Annes, connected later by an *Annes* possibility set.

```rust
    // --- Two doxastically actual universes (never both co-locations) --------
    let u_edi = m.declare::<Universe>(iri("universe/mda-edinburgh"));
    let u_btn = m.declare::<Universe>(iri("universe/mda-brighton"));

    // Counterpart Annes — distinct individuals, each bound to one universe.
    let anne_edi = m.declare::<Person>(iri("person/Anne#u_edi"));
    let anne_btn = m.declare::<Person>(iri("person/Anne#u_btn"));
    m.is_part_of(&anne_edi, &u_edi);
    m.is_part_of(&anne_btn, &u_btn);
```

**What not to do.** Declaring a single Anne and asserting she `isPartOf` both Edinburgh and Brighton on the same period folds classical inconsistency *into* the graph. The modal form keeps the counterparts distinct.

---

## Step 4 — Co-location states (the 4D “Anne-in-city-on-day” worms)

Each location claim is a `State`: a temporal part of the relevant Anne that is also part of the city, the day, and that Anne’s universe. This is the same mereological co-location pattern IES uses for ordinary “was there then” facts — now duplicated once per doxastic universe.

```rust
    // Co-location states: Anne-part ∩ city ∩ day, inside each universe.
    let anne_in_edi_state = colocated_on(&mut m, &anne_edi, &edinburgh, &period, &u_edi, "edi");
    let anne_in_btn_state = colocated_on(&mut m, &anne_btn, &brighton, &period, &u_btn, "btn");
```

The helper builds that four-way `isPartOf` / `isTemporalPartOf` structure:

```rust
/// A temporal part of `person` that is also part of `city`, `period`, and
/// `universe` — the 4D co-location pattern from `car_parked` / `people_weighed`.
fn colocated_on(
    m: &mut ies_top::Model,
    person: &ies_top::Id<Person>,
    city: &ies_top::Id<Location>,
    period: &ies_top::Id<ParticularPeriod>,
    universe: &ies_top::Id<Universe>,
    tag: &str,
) -> ies_top::Id<State> {
    let state = m.declare::<State>(iri(&format!("state/Anne-in-{tag}-2024-03-30")));
    m.is_temporal_part_of(&state, person);
    m.is_part_of(&state, city);
    m.is_part_of(&state, period);
    m.is_part_of(&state, universe);
    state
}
```

In the paper’s vocabulary, composing Anne × Edinburgh × 30 March via *comoverlapability* yields the individual possibility “Anne in Edinburgh on 30 March 2024” ([§5.2.1](https://ceur-ws.org/Vol-4175/stids-4.pdf)). The states above are the concrete members of those possibilities in our two universes.

---

## Step 5 — Individual possibilities (counterpart sets)

`Possibilities` is the IES Possibilia class for a counterpart set — what the paper calls an *individual possibility* (e.g. “Annes”, “Edinburghs”, “30 March 2024s”). Membership is recorded with `hasPossibilities`: each concrete individual points at the set of its counterparts.

We also declare possibility nodes for the two co-location states. Those are the objects that will later sit in the system’s contingent beliefs — the formal stand-ins for the two English target sentences.

```rust
    // --- Individual possibilities (counterpart sets) ------------------------
    let annes = m.declare::<Possibilities>(iri("poss/Annes"));
    let edinburghs = m.declare::<Possibilities>(iri("poss/Edinburghs"));
    let brightons = m.declare::<Possibilities>(iri("poss/Brightons"));
    let dates = m.declare::<Possibilities>(iri("poss/2024-03-30s"));
    let anne_in_edi_poss =
        m.declare::<Possibilities>(iri("poss/Anne-in-Edinburgh-2024-03-30"));
    let anne_in_btn_poss =
        m.declare::<Possibilities>(iri("poss/Anne-in-Brighton-2024-03-30"));

    m.has_possibilities(&anne_edi, &annes);
    m.has_possibilities(&anne_btn, &annes);
    m.has_possibilities(&edinburgh, &edinburghs);
    m.has_possibilities(&brighton, &brightons);
    m.has_possibilities(&period, &dates);
    m.has_possibilities(&anne_in_edi_state, &anne_in_edi_poss);
    m.has_possibilities(&anne_in_btn_state, &anne_in_btn_poss);
```

Notice both `anne_edi` and `anne_btn` join the same `Annes` set. That is the counterpart link that makes de re talk about “Anne” well-formed across worlds ([§5.2.1](https://ceur-ws.org/Vol-4175/stids-4.pdf); Lewis’s counterpart theory).

---

## Step 6 — De se / de nunc: who believes this, and when?

Actuality in Lewis is indexical: *the* actual world is the world of which *I* am part ([§5.2.2](https://ceur-ws.org/Vol-4175/stids-4.pdf)). For an information system, the paper adds an explicit “me” sign so ownership is in the graph, not a comment in the docs.

`Actualities` here is the believer-at-a-time — *me now* — and `CurrentMeSign` is the indexical that refers to it. Together they cover the ownership (de se) and currency (de nunc) challenges ([§4.4–4.5](https://ceur-ws.org/Vol-4175/stids-4.pdf), [§5.2.2–5.2.3](https://ceur-ws.org/Vol-4175/stids-4.pdf)).

```rust
    // --- de se / de nunc owner of current beliefs ---------------------------
    let me_now = m.declare::<Actualities>(iri("actualities/me-now"));
    let me_sign = m.declare::<CurrentMeSign>(iri("sign/current-me"));
    m.is_referred_to_by(&me_now, &me_sign);
```

---

## Step 7 — Comcontingents: both location possibilities as current beliefs

The paper’s cash-out of “it is contingent that Anne was *actually* in Edinburgh” is: the Anne-in-Edinburgh-on-that-day possibility is *compossible* (here: *comcontingent*) with *my doxastic actualities* ([§5.2.3](https://ceur-ws.org/Vol-4175/stids-4.pdf), Table 1).

In the preview vocabulary that becomes a `Comcontingents` container linked from `me_now` via `hasBeliefs`, with each location possibility (and the actualities themselves) entered via `belief`. Both English sentences land as members of the same contingent-belief set — without forcing them into one universe.

```rust
    // Both location-on-date possibilities are *comcontingent* with the
    // system's doxastic actualities — the two English target sentences.
    let beliefs = m.declare::<Comcontingents>(iri("beliefs/me-now-comcontingents"));
    m.has_beliefs(&me_now, &beliefs);
    m.belief(&anne_in_edi_poss, &beliefs);
    m.belief(&anne_in_btn_poss, &beliefs);
    // Actualities itself is also a member of the doxastic container.
    m.belief(&me_now, &beliefs);
```

That is the formal answer to “inconsistent knowledge” ([§4.3](https://ceur-ws.org/Vol-4175/stids-4.pdf)): both claims are doxastically live; only one can be true in any single world.

---

## Step 8 — Query the model the way an analyst would

The STIDS use case is not complete until the store can answer the natural question ([§1](https://ceur-ws.org/Vol-4175/stids-4.pdf)): *Could Anne have been in Edinburgh?* → *Yes, possibly.*

We treat “possibly” as: the location possibility appears in the belief relation. We also guard modal consistency: both co-location states must not share a universe.

```rust
    // --- Query demo (stderr) ------------------------------------------------
    let could_edi = !m.belief_objects(&anne_in_edi_poss).is_empty();
    let could_btn = !m.belief_objects(&anne_in_btn_poss).is_empty();
    let both_same_world = shared_universe(&m, &anne_in_edi_state, &anne_in_btn_state, &[&u_edi, &u_btn]);
    eprintln!(
        "Could Anne have actually been in Edinburgh on 2024-03-30? → {}",
        if could_edi {
            "Yes, possibly"
        } else {
            "No"
        }
    );
    eprintln!(
        "Could Anne have actually been in Brighton on 2024-03-30?  → {}",
        if could_btn {
            "Yes, possibly"
        } else {
            "No"
        }
    );
    eprintln!("Both co-locations in the same universe?                  → {both_same_world}");
    assert!(could_edi && could_btn);
    assert!(!both_same_world);
```

The shared-universe check is the “guard rail” the paper asks for ([§4.6](https://ceur-ws.org/Vol-4175/stids-4.pdf)): highlight modal inconsistency if Anne is in both cities in the same possible world.

```rust
/// True if both co-location states are `isPartOf` the same candidate universe
/// (modal inconsistency for this use case).
fn shared_universe(
    m: &ies_top::Model,
    a: &ies_top::Id<State>,
    b: &ies_top::Id<State>,
    universes: &[&ies_top::Id<Universe>],
) -> bool {
    let parts_a: Vec<_> = m
        .is_part_of_objects(a)
        .into_iter()
        .filter_map(|id| id.iri().map(str::to_owned))
        .collect();
    let parts_b: Vec<_> = m
        .is_part_of_objects(b)
        .into_iter()
        .filter_map(|id| id.iri().map(str::to_owned))
        .collect();
    universes.iter().any(|u| {
        let Some(iri) = u.iri() else {
            return false;
        };
        parts_a.iter().any(|p| p == iri) && parts_b.iter().any(|p| p == iri)
    })
}
```

Finally we validate the ies-top / ies-core fragment (Possibilia has no SHACL shapes in the preview yet) and print Turtle so you can inspect the graph:

```rust
    // ies-top / ies-core fragment: expect clean. Possibilia has no SHACL yet.
    let report = ies_core::validate::validate(&m);
    eprintln!(
        "ies-core validate: {} results, conforms = {}",
        report.results.len(),
        report.conforms()
    );

    print!("{}", m.to_turtle_string()?);
    Ok(())
}
```

Expected stderr shape: both cities → `Yes, possibly`; same-universe check → `false`.

---

## Ontology cheat sheet

| Role in the story | IES Possibilia term | Paper concept |
| --- | --- | --- |
| Counterpart set | `Possibilities` + `hasPossibilities` | Individual possibility / counterpart set ([§5.2.1](https://ceur-ws.org/Vol-4175/stids-4.pdf)) |
| Believer-at-a-time | `Actualities` + `CurrentMeSign` / `isReferredToBy` | De se / de nunc “my actuality” ([§5.2.2–5.2.3](https://ceur-ws.org/Vol-4175/stids-4.pdf)) |
| Contingent beliefs | `Comcontingents` + `belief` / `hasBeliefs` | Comcontingent with my doxastic actualities (Table 1) |
| Possible worlds | `Universe` (`ies-top`) | Doxastically actual worlds ([§5.2.3](https://ceur-ws.org/Vol-4175/stids-4.pdf)) |
| Co-location | `State` + mereology (`ies-top` / `ies-core`) | 4D overlap / comoverlapability ([§3.4](https://ceur-ws.org/Vol-4175/stids-4.pdf), [§5.2.1](https://ceur-ws.org/Vol-4175/stids-4.pdf)) |

Preview vocabulary: [ies-possibilia.ttl](https://github.com/IES-Org/ies-possibilia/blob/preview-release/v0.1.0/spec/ies-possibilia.ttl).

---

## Critique

This example is a faithful *executable sketch* of the STIDS dual-city use case — not a complete intelligence store. A few tensions are worth naming for anyone adapting the pattern.

**1. Preview ontology, evolving terms.** IES Possibilia is an early preview of ideas introduced at STIDS 2024. Class and property names (`Comcontingents`, `belief` as membership-via-typing, dangling powertype IRIs) will move. Treat the Rust API as a laboratory for the *architecture*, not as frozen standard English.

**2. Thin query layer.** “Yes, possibly” here is “this possibility IRI participates in `belief`.” The paper’s fuller story includes credence rankings, testimony chains, and Bayesian updating over doxastic actualities ([§4.7–4.8](https://ceur-ws.org/Vol-4175/stids-4.pdf), [§5.2.3](https://ceur-ws.org/Vol-4175/stids-4.pdf)). None of that is in the example; modal membership is the floor, not the ceiling.

**3. Universes are stipulated.** We hand-author two `Universe`s and never both-co-locate inside one. The paper wants *guard rails* for modal inconsistency ([§4.6](https://ceur-ws.org/Vol-4175/stids-4.pdf)); our `shared_universe` check is a demo, not a general reasoner. A production system needs controlled ingest rules ([§6](https://ceur-ws.org/Vol-4175/stids-4.pdf)), not only well-meaning authors.

**4. Counterpart identity is pragmatic.** Lewis stresses that counterpart relations are purpose-relative ([§5.2.1](https://ceur-ws.org/Vol-4175/stids-4.pdf)). Putting both Annes in one `Annes` set is the right move for this tutorial; real systems will need policies for when two person-nodes count as counterparts — especially across agencies and over time (currency, memory reconsolidation).

**5. Ownership is a single “me”.** De se ownership is modelled, but only for one system. Multi-agency disagreement (the paper’s IC elements example, [§4.4](https://ceur-ws.org/Vol-4175/stids-4.pdf)) needs nested or parallel centered patterns — the same shape reused per believer ([§5.2.3](https://ceur-ws.org/Vol-4175/stids-4.pdf) on testimony).

**6. Validation gap.** ies-core SHACL still checks the non-possibilia fragment; Possibilia itself has no shapes yet. Type-checked builders reduce foot-guns; they do not yet enforce modal consistency at validation time.

None of these undercut the central pedagogical point: classical inconsistency and modal consistency come apart once counterpart Annes live in distinct universes and share a doxastic container.

---

## Conclusions

Representing “Anne might actually have been in Edinburgh *and* in Brighton on 30 March 2024” is not a matter of softening a boolean flag. It is a matter of giving uncertainty its own formal furniture:

1. **Four-dimensional co-location** for each concrete location claim.
2. **Distinct universes** so mutually exclusive actualities never cohabit.
3. **Counterpart sets (`Possibilities`)** so we can still talk about *Anne*, *Edinburgh*, and *that Saturday* across worlds.
4. **Centered doxastic actuality (`Actualities` + `CurrentMeSign`)** so beliefs have an owner and a “now.”
5. **Comcontingent belief membership** so both possibilities are live for the system without being asserted as jointly actual in one world.

That is the Lewisian, extensional programme of [*Digitalizing Uncertain Information*](https://ceur-ws.org/Vol-4175/stids-4.pdf) in miniature: modality cashed out as set theory and mereology, implementable with ordinary enterprise resources rather than boxes and diamonds ([§5.1.1](https://ceur-ws.org/Vol-4175/stids-4.pdf), [§7](https://ceur-ws.org/Vol-4175/stids-4.pdf)).

If you work with intelligence data, entity resolution, or knowledge graphs that must say “possibly” without lying, this pattern is worth stealing — carefully, and with your eyes open to the critique above. The next steps the paper itself flags are use-case testing at scale, controlled-system rules, and richer credence and testimony structure. This example is the smallest graph that already answers: *Yes, possibly — and not both in the same world.*

---

## Further reading

- Partridge, Mitchell & Cola — [*Digitalizing Uncertain Information*](https://ceur-ws.org/Vol-4175/stids-4.pdf) (STIDS 2024 / [arXiv:2507.21173](https://arxiv.org/abs/2507.21173))
- [IES Possibilia preview](https://github.com/IES-Org/ies-possibilia) (vocabulary and upstream notes)
- Crate design notes and runnable source: see the [IES Possibilia preview](https://github.com/IES-Org/ies-possibilia) repository

## TTL Results
The program above is executable and produces the following TTL, which can be visualised using [RDF Grapher](https://www.ldf.fi/service/rdf-grapher) or [TTL Viewer](https://twalmsley.github.io/ttlvis/index.html):
```ttl
@prefix ex: <http://example.org/ies/anne-locations/> .
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix ies_top: <http://purl.org/ies/top/v0/ont/> .
@prefix ies_core: <http://purl.org/ies/core/v0/ont/> .
@prefix owl: <http://www.w3.org/2002/07/owl#> .
@prefix poss: <http://purl.org/ies/possibilia/v0/ont/> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix purl: <http://www.w3.org/2001/XMLSchema#> .

<http://example.org/ies/anne-locations/universe/mda-brighton> a ies_top:Universe .
<http://example.org/ies/anne-locations/poss/Anne-in-Brighton-2024-03-30> a <http://purl.org/ies/possibilia/v0/ont/Possibilities> ;
	<http://purl.org/ies/possibilia/v0/ont/belief> <http://example.org/ies/anne-locations/beliefs/me-now-comcontingents> .
<http://example.org/ies/anne-locations/poss/Edinburghs> a <http://purl.org/ies/possibilia/v0/ont/Possibilities> .
<http://example.org/ies/anne-locations/poss/Brightons> a <http://purl.org/ies/possibilia/v0/ont/Possibilities> .
<http://example.org/ies/anne-locations/state/Anne-in-btn-2024-03-30> <http://purl.org/ies/possibilia/v0/ont/hasPossibilities> <http://example.org/ies/anne-locations/poss/Anne-in-Brighton-2024-03-30> ;
	ies_top:isTemporalPartOf <http://example.org/ies/anne-locations/person/Anne#u_btn> ;
	a ies_top:State ;
	ies_top:isPartOf <http://example.org/ies/anne-locations/universe/mda-brighton> , <http://example.org/ies/anne-locations/20240330T000000Z> , <http://example.org/ies/anne-locations/location/Brighton> .
<http://example.org/ies/anne-locations/poss/Anne-in-Edinburgh-2024-03-30> a <http://purl.org/ies/possibilia/v0/ont/Possibilities> ;
	<http://purl.org/ies/possibilia/v0/ont/belief> <http://example.org/ies/anne-locations/beliefs/me-now-comcontingents> .
<http://example.org/ies/anne-locations/beliefs/me-now-comcontingents> a <http://purl.org/ies/possibilia/v0/ont/Comcontingents> .
<http://example.org/ies/anne-locations/location/Edinburgh> <http://purl.org/ies/possibilia/v0/ont/hasPossibilities> <http://example.org/ies/anne-locations/poss/Edinburghs> ;
	a <http://purl.org/ies/core/v0/ont/Location> .
<http://example.org/ies/anne-locations/person/Anne#u_edi> <http://purl.org/ies/possibilia/v0/ont/hasPossibilities> <http://example.org/ies/anne-locations/poss/Annes> ;
	a <http://purl.org/ies/core/v0/ont/Person> ;
	ies_top:isPartOf <http://example.org/ies/anne-locations/universe/mda-edinburgh> .
<http://example.org/ies/anne-locations/universe/mda-edinburgh> a ies_top:Universe .
<http://example.org/ies/anne-locations/sign/current-me> a <http://purl.org/ies/possibilia/v0/ont/CurrentMeSign> .
<http://example.org/ies/anne-locations/poss/2024-03-30s> a <http://purl.org/ies/possibilia/v0/ont/Possibilities> .
<http://example.org/ies/anne-locations/poss/Annes> a <http://purl.org/ies/possibilia/v0/ont/Possibilities> .
<http://example.org/ies/anne-locations/20240330T000000Z> <http://purl.org/ies/possibilia/v0/ont/hasPossibilities> <http://example.org/ies/anne-locations/poss/2024-03-30s> ;
	a <http://purl.org/ies/core/v0/ont/ParticularPeriod> ;
	<http://purl.org/ies/core/v0/ont/iso8601PeriodRepresentation> "2024-03-30T00:00:00Z"^^<http://www.w3.org/2001/XMLSchema#dateTime> .
<http://example.org/ies/anne-locations/location/Brighton> <http://purl.org/ies/possibilia/v0/ont/hasPossibilities> <http://example.org/ies/anne-locations/poss/Brightons> ;
	a <http://purl.org/ies/core/v0/ont/Location> .
<http://example.org/ies/anne-locations/state/Anne-in-edi-2024-03-30> <http://purl.org/ies/possibilia/v0/ont/hasPossibilities> <http://example.org/ies/anne-locations/poss/Anne-in-Edinburgh-2024-03-30> ;
	ies_top:isTemporalPartOf <http://example.org/ies/anne-locations/person/Anne#u_edi> ;
	a ies_top:State ;
	ies_top:isPartOf <http://example.org/ies/anne-locations/location/Edinburgh> , <http://example.org/ies/anne-locations/universe/mda-edinburgh> , <http://example.org/ies/anne-locations/20240330T000000Z> .
<http://example.org/ies/anne-locations/actualities/me-now> a <http://purl.org/ies/possibilia/v0/ont/Actualities> ;
	<http://purl.org/ies/possibilia/v0/ont/hasBeliefs> <http://example.org/ies/anne-locations/beliefs/me-now-comcontingents> ;
	<http://purl.org/ies/possibilia/v0/ont/belief> <http://example.org/ies/anne-locations/beliefs/me-now-comcontingents> ;
	<http://purl.org/ies/possibilia/v0/ont/isReferredToBy> <http://example.org/ies/anne-locations/sign/current-me> .
<http://example.org/ies/anne-locations/person/Anne#u_btn> <http://purl.org/ies/possibilia/v0/ont/hasPossibilities> <http://example.org/ies/anne-locations/poss/Annes> ;
	a <http://purl.org/ies/core/v0/ont/Person> ;
	ies_top:isPartOf <http://example.org/ies/anne-locations/universe/mda-brighton> .

```
