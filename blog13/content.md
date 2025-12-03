# The Task 
Attempt to use the mathematical concepts of Category Theory and apply them to a system specification problem, with the following goals:

1. Create a mathematical description of a set of requirements using Category Theory.
2. Based on the requirements, produce a behaviour specification describing how the system components work.
3. Combine the system components into a complete system and define it's behaviour as a combination of the sub-components.

# TL;DR

- The target system is a simple torch, or flashlight, with [these requirements](FlashlightTextRequirements1.html) generated mainly by Google Gemini.
- I used this as a guide to produce [this specification](FlashlightCatTheoryRequirements2.pdf) using Category Theory concepts.
- I then improved it and produced [this specification](FlashlightCatTheoryRequirements3.pdf), which is much better than the first version.
- Finally I produced [the more detailed description](TheSystemInMoreDetail.pdf) document, covering the behaviour of the components and the combined system. At the end of this document there is some output from Google Gemini which I asked to produce a combined system from the components, which worked better than expected. It was able to infer that a sequence of button presses on the input produces an output that is either: Off, Dim, or Bright, via a couple of intermediate components.

## Observations

- Cat Theory for Requirements Specification
    - This is quite hard work even for such a simple system as the torch, and the end result can only be understood by people interested in learning the notation and a bit of Category Theory.
    - The mathematical specification needs to be translated into a text specification, which can be done by a GPT, but perhaps this defeats the object of the mathematical specification.
    - The mathematical specification is more rigorous than the text description, and might be more useful in scenarios where it is used as part of an automated process.
    - There may well be systems where the more formal specification is worth the extra effort needed to produce it.

- Cat Theory for Behaviour Specification
    - There is a part of Category Theory called Polynomial Functors, which are objects in the **Poly** category, which are useful for specifying system behaviours.
    - A morphism between Polynomial Functors, known as a Lens, can define state transitions of systems, and can also model a changing inteface to the system as the behaviour proceeds.
    - The Lenses can be combined algebraically to produce more complex systems made up of smaller components, which again might be useful for automated design of systems.
    - This part of the process is also quite difficult, but might be worth the effort for some systems. 
    - One 'blue sky' application might be 'what can I make with these components' scenario which tries all possible combinations of components in an attempt to find novel systems.

