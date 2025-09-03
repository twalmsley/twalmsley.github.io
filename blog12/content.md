# Class, Aggregation, Composition, in HQDM

These three concepts can be confusing for some people when working with HQDM, so here is a definitive guide. Firstly, what is the definition of each?

- **Class** - An abstract object that has members and whose identity is defined by its membership.
- **Aggregation** - A relationship where the whole is at least the sum of the parts.
- **Composition** - An aggregation where the whole is an arrangement of the parts that results in emergent properties.

Simple and straightforward, but some clarification using an example would probably be useful. For this example, imagine a particular car and all of the parts that make up the car, then we can consider the three concepts in this context to understand them a little better. We'll consider the car parts in three different circumstances for each of the concepts: 

1. The parts as manufactured in their source factories around the world, when they are still in those factories, i.e. still distributed and far apart from each other.
2. A pile of those parts. The parts are now at the same location, but have not yet been assembled in a car.
3. The car. The parts have been assembled into a functioning car.

## Car Parts as a Class

In HQDM, instances of `Class` are all possible sets of `Things`, and therefore `Class` is the power set of `Thing`. This means that a class exists whose members are all the parts of the car, regardless of where or when the parts exist. So we can certainly talk about this class, and item 1 above does exactly that - without this instance of `Class`, I would not have been able to write item 1 in the first place.

Since the class doesn't care about the space or time locations of the objects, it can be used to represent the car parts for items 2 and 3 as well, but the question is whether this is a useful thing to do in this case. 

We _can_ refer to the class, but should we? It's useful to refer to the class for this discussion, but are there any other circumstances where the class is useful? I can't think of any right now, and I can't see a need for writing software that refers to the class - there doesn't seem to be a need for this particular instance of `Class` in any system I can think of, but if a need arises, then the class is there ready to be used. 

It is worth noting that these `Class` instances are immutable, unlike their software counterparts, which can usually have items added and removed. The HQDM classes are eternal, having no spatio-temporal extent of their own, but it may be possible to find an equivalence of some sort between the collective spatio-temporal extents of the members and the class itself. This won't work in all circumstances, however, because classes can have classes as members, so not all classes will have members that have spatio-temporal extents. 

## Car Parts as an Aggregation

When I think of an `Aggregation`, I tend to think of a pile of things, or a bag/box of things, and the things don't necessarily have to be of the same type. So an aggregation of car parts is just as valid as an aggregation of grains of sand, or water molecules, _as long as they are all inthe same place_. The idea that the parts of an aggregation are all located in the same place at the same time seems to be a key part of the concept of aggregation. If I add or remove parts of an aggregation, then the result is a different (state of) the aggregation. The aggregation is a real thing that exists in space and time, unlike the `Class` discussed earlier, i.e. it really does have a spatio-temporal extent, which means it can be a part of other spatio-temporal extents, which a class can't. The parts of the aggregation can be rearranged arbitrarily and the aggregation would still be valid.

So an aggregation does not seem to be appropriate for item 1 above, when the parts are not all in the same location, but it is a good fit items 2 and 3, when the parts are all in the same location. There is a difference between items 2 and 3, which is where `Composition` comes in, i.e. when one of the arbitrary rearrangements of the parts just happens to result in a functioning car.

## Car Parts as a Composition

Compositions are useful arrangements of parts, in that the particular arrangement functions in a way that other arrangements do not. So when the car parts are arranged correctly, you can drive it away, which you cannot do with many of the other arrangements. A `Composition` of parts is a subset of the `Aggregations` of parts, and is those arrangements that suit some specific purpose, such as driving in this case.

Item 1 above is clearly not a composition. Item 2 might not seem like a composition at first sight, but perhaps some arrangements of the parts are useful for things other than driving, such as a piece of art, for example. There have been works of art that some people see merely as aggregations - piles of rubbish - but those in the know will recognise the composition and get something more out of it.

Item 3 is clearly an example of a composition, since the car is built and is drivable as the intended use of the parts.

## Conclusions

Classes are essential to defining `Kinds`, since `Kinds` are those classes whose members are all of the same type. So a class which happens to have all possible instances of, say, `Person` as its members (regardless of where or when those `Person` objects exist) is actually a `Kind`, and is identical with the entity type `Person`. If one or more people are missing, then the class is merely a class and not a kind. Classes are useful for grouping together items for some purpose, such as a set of possible responses to a question, or a set of products offered for sale by an organisation.

Aggregations are useful for representing piles/bags/boxes of `Things` that have no current useful arrangement that would make them a `Composition`, for example, the pile of car parts, the plastic parts of a kit for building an Airfix model of a Spitfire, or a flat-pack piece of furniture from Ikea.

Compositions are those arrangements of aggregations that result in some useful property that the mere aggregation doesn't have, e.g. a functioning car, an Airfix model Spitfire, or a new Ikea wardrobe.

So that's that then. But before you go, I want to find the total cost of all the parts of the car, so would you use a `Class`, an `Aggregation`, or a `Composition`? All three would work, but which one would you prefer? Something to think about.
