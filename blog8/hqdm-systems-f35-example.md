# HQDM Systems F-35 Example

This document contains an example related to HQDM (High Quality Data Model) systems using F-35 fighter jet components. This is, of course, a contrived example based on information from Wikipedia, and a real-world version would be much more detailed.

## Overview

The example scenario is taken from the code in my fork of the MagmaCore library [here](https://github.com/twalmsley/MagmaCore). The code creates two Functional Systems, one representing an aircraft as a system, and one representing an engine as a system. It then installs the same engine in both systems. The data is stored in an Apache Jena database and exported as RDF for visualisation using [RDF-Grapher](https://www.ldf.fi/service/rdf-grapher).

Each of the two systems represents a particular physical object, with the first representing a specific individual F35 aircraft, and the second a specific individual F135 engine. The engine system can be referred to independently of the aircraft whether or not it is installed in an aircraft.

Additionally, there are Ordinary Functional Objects that can be installed in the systems at various times.

So when an actual engine is installed in an engine system, and the engine system is installed in the aircraft, the two system components representing the engine, as well as the engine itself, all occupy the same spatio-temporal extent and are therefore identical for the time period that the engine is installed. 

## Systems and Components Overview

The following diagram represent a view of a specific F35 aircraft with made-up tail number 2101, and its components. The System Components can go through periods where they are missing, such as when an engine is removed for maintenance - the Engine System Component is empty for the time period that there is no engine installed, but we can still refer to it as the aircraft's engine.

![F-35 System Components](f35-system-2.png)

The next diagram shows the F135 engine system and its components.

![F135 Engine System](f135-system-1.png)

Next we have the Ordinary Functional Objects that can be installed as the system components. These are likely to be instances of more specific types than direct instances of Ordinary Functional Object (as they are in the actual code), but this representation is fine for purpose of the example.

![Functional Objects](FunctionalObjects.png)

## Representing Installed Parts

Installing a part involves creating an object which is an Installed Functional System Component, and which is also a state of both the System Component it is installed as, _and_ the Ordinary Functional Object which is installed. The Installed Functional System Component is a _temporalPartOf_ the System Component and the Ordinary Functional Object.

The next two diagrams should illustrate the situation more clearly, click the links to see the full-size images.

This diagram shows an engine installed in an engine system: `ex:99` is the installed engine and, as you can see, it is an Installed Functional System Component and is a `temporalPartOf` the System Component and the Ordinary Functional Object. Not shown is that it is also a state of both the System Component and the Ordinary Functional Object.

![Installed Engine in Aircraft](installed-engine-in-aircraft.png)
[Installed Engine in Aircraft](installed-engine-in-aircraft.png)

Similarly, the engine can be recorded as being installed in the aircraft - note that it is not the Engine System that is installed, rather that the same engine can be installed in both systems at the same time:

![Installed Engine in Engine System](installed-engine-in-engine-system.png)
[Installed Engine in Engine System](installed-engine-in-engine-system.png)

Importanly, using systems and system components allows us to refer to 'the engine in F35 aircraft 2101' regardless of which _actual_ engine is installed there. We can also refer to the `F135 System 1001` turbine, regardles of which actual turbine is currently installed. 

## Adding the Other Components

Extending the model to include the other installed components for both the aircraft and the engine systems results in quite a large model for such a small example. The corresponding code for the domain model extension is also quite large due to the need for new Java classes for all of the entity types. In practice, with millions of parts, it is more likely that dymanic types will be used, rather than Java classes. 

![F-35 System Components](f35-system-components.png)
[F-35 System Components](f35-system-components.png)

## Intended Roles

Each of the types in the example will have `intendedRole` predicates, possibly many, and when installing a part as a component, the `intendedRole` must match the target, or at least one of the `intendedRoles`. In this way it should be possible to model the fact that an aircraft can have one of several types of engine installed, as long as the engine's `intendedRole` matches one of the aircraft's supported `intendedRoles`

## Other Applications of Systems and System Components

Systems and System Components are very widely applicable in many scenarios, some of which are listed below.

- Replaceable physical parts installed in any mechanical, electrical, or electronic systems.
- Replaceable biological parts, such as kidney, lung, and heart transplants.
- Certain elements of logistics chains, such as shipping containers installed on a container ship, train, or truck.
- Specific versions of software components installed on a computer system.
- People installed in particular positions within organisations. For example, the President of the United States is a system component with a continuous succession of installed persons since George Washington.

## Further Information

(Some of these links might need you to be logged in to GitHub)

- [HQDM Online](https://hqdmtop.github.io/hqdmFramework/hqdm_framework/hqdm_framework.htm#entities) - A browseable HQDM top level ontology.
- [HQDM RDF](https://github.com/hqdmTop/hqdmOntology/blob/main/src/ontology/hqdm.ttl) - HQDM mapped to RDFS/RDF.
- [Full RDF for this example](rdf.ttl) - A TTL (Turtle) file which is an export of the Apache Jena database created by the example program.
- [MagmaCore F35 Model Extension](https://github.com/twalmsley/MagmaCore/tree/main/model-extension-f35) - a domain extension for HQDM to add the necessary F35-specific classes.
- [MagmaCore F35 Example Usage](https://github.com/twalmsley/MagmaCore/blob/main/examples/src/main/java/uk/gov/gchq/magmacore/examples/extensions/F35ModelExtensionTest.java) - a program that uses the F35 domain extension to illustrate how to use Systems, System Components, Ordinary Physical Objects, and Installed Objects.