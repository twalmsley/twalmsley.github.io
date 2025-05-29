# AI Coding Part 2

> _This blog post and its mistakes are entirely human-generated_

## The Story So Far

In the previous [Blog Post](../blog5/blog5.html) I described an experiment to develop a basic but functional web application using the Cursor AI IDE, and discussed some of the difficulties and successes along the way. In this update I cover a few extra points that have come up in the time since my last post:

1. Running out of fast credits in the IDE.
2. Manual updates where the AI models weren't able to cope.
3. Manual updates for security reasons.
4. AI updates where things went well.
5. The productivity web application MVP.

## Bottom Line Up Front

For those with short attention spans, here is the bottom line for each point:

1. Slow credits were fine, I didn't notice too much of a reduction in productivity.
2. Some wide-ranging refactors I asked for were too big for the LLM's context window, so it tends to mess up pretty badly for these cases. Filtering a task list by date to show 'today's tasks', 'tasks this week', and 'tasks this month' had to be done manually using the 'data-fns' library, because the LLM just could not generate correctly functioning code, which was frustrating.
3. Switching authentication to a library rather than custom code, and adding Stripe integration were too important to leave to the AI. You really need to know what's going on with the code here, so it's best done manually - and it wasn't difficult.
4. The LLMs were able to do some quite significant changes, such as adding new pages, a task table summary, table sorting and filtering, and table pagination. These were mostly done with a single prompt and it saved me a lot of time compared to doing it myself.
5. In the end I have a productivity MVP ready for final testing and deployment - I'm fairly confident it's secure, and that the payment process works fine. I also have a 'Go Live' plan to cover the final setup and deployment steps, which could probably be done in a week, but will take until sometime in mid- to late-june due to other commitments.

Overall I think I like using the Cursor IDE and will continue to develop the productivity app as well as a few other ideas I want to follow up on.

Read on if you need more detail, otherwise thanks for reading...

## Fast or Slow

## Avoiding Death Spirals

## Playing it Safe

## Let it Rip

## Productivity App

## Next Steps
