# Outline
Try to write a version of HQDM that is simpler:

- No Classes or Kinds - use Set\<T\> instead.
- No States - derive state from activities.
- No associations - everything is an activity.
- Extension is by sub-typing.
- No inheritance of attributes or relations that need to be overridden or modified.
- No serialisation format - no: JSON, RDFS, SHACL, EXPRESS, XML, etc.
- Define everything functionally as operations that transform data structures.

# Introduction
In this blog post, which is a follow-on from my previous blog post about HQDM, I will attempt to resolve some of the issues I raised, with the aim of producing a simplified and more understandable implementation of HQDM that is close enough to the original so as to be compatible with it. I'm going to start by removing some of the complexities of HQDM, along with an explanation of why they can be removed without loss of generality.

Once the clutter has been removed I will then try to implement HQDM as a library, which may serve as an example to help develop the MagmaCore library further using the principles proved here.
# HQDM on a Diet
Firstly, let me remove some concepts from HQDM which, if you're familiar with HQDM, may well be painful initially, but if you follow through the logic I believe you will see that the benefits outweigh the costs.
## Language
HQDM was originally defined using the EXPRESS and EXPRESS-G data modelling language, while for the MagmaCore library an informal mapping to RDF was produced. I am going to start from a programming language instead and will assume that any future serialisation format for HQDM will preserve the semantics of that programming language, which will then allow other implementations to follow the same semantics in their own way. 

Candidate languages in my mind, based on languages I am familiar with, are Java, Haskell, and TypeScript, because this implementation will make use of the compile-time type checking features of the language, which I feel is an essential part of data modelling. It will go some way towards ensuring programs create valid data models rather than relying solely on runtime type checking. Given that the [MagmaCore](https://github.com/gchq/MagmaCore) library is written in Java, I will use Java here and then move on to Haskell and TypeScript later.
## No Dynamic Extensions
HQDM provides several mechanisms for extending the model, some of which duplicate existing constructs in the implementation language. For example, the use of `kinds` is the same as adding new entity types in EXPRESS, the use of the `relation` entity type is already covered by the EXPRESS language, while adding sub-types of entities is a given in EXPRESS so does not need to be modelled as a subtype of `relation`. Similarly for `classification`, `aggregation`, and `composition`. I will assume that new entity types will be added as Java classes at compile time rather than as runtime data, so that we can take advantage of the compiler's type-checking features. 
## No Classes
HQDM has a whole type hierarchy defining `class_of_X` for each entity type `X`, where each class is a mathematical Set, but the ability for form arbitrary sets can be more concisely captured using the Java `Set<T>` construct. This hierarchy of classes can be confusing, but when combined with the `member_of` relationship and its variants it also has the problem that the `member_of` relation itself needs modifying to restrict the types to the correct ones. For example, only a `person` can be a `member_of` a `class_of_person`, but the inherited `member_of` must be overridden to capture this. With Java, a `Set<Person>` doesn't need anything overridden and fits more naturally with the idea that sets know their members, rather than each entity knowing the sets it is a member of. 

As a side note, in HQDM classes are immutable mathematical sets, so the entity type `class_of_person`, for example, represents all possible sets of person entities, which is an incredibly large set of sets - `class_of_person` is the power set of `person`. We can't represent this in programs in any meaningful way so we use mutable sets and only keep track of the sets we're interested in.
## No Kinds
In HQDM, 'kinds' are an extension mechanism for adding new entity types in data. I propose that we only add entity types as new Java classes in the type hierarchy, therefore we can exclude kinds.
## No States
This one will be the hardest to swallow for some people I think. In HQDM, states are used to represent temporal parts of whole-life entities. For example, there is a temporal part of my car that is associated with me as the owner and that temporal part began when I bought the car and ends in the future when I stop owning it. The 'ownership' association is between the state of the car and a corresponding state of me as a person owning the car, and the association itself also has the same temporal extent as the state of car and state of person. States are also used to assign roles to the states since the role is not a whole-life role of the car or person.

The need for states introduces new entity types called `state_of_X` for each concrete entity type `X` and, like `class_of_X` or `kind_of_X`, adds unnecessary complexity. I propose that states are not needed under the following conditions:

1. The temporal extent of an association is enough to identify that a whole-life object only participates in the association for the duration of the association. If necessary this temporal extent could be used to derive the state as a temporal part of the entity, but I don't believe it is necessary.
2. The role that an entity plays can be defined using more specialised relationships instead of the far too general `participant_in` relation that gives no direct indication of the role, hence the need to add it to the state. 

The diagrams below illustrate the difference, with the left side showing the states, and the right side showing the same model without states. These two diagrams are equivalent, but the right side is a simpler representation of the model that is easier to create and understand.

![states_1](./states_1.svg)

## No Associations
## Parthood
