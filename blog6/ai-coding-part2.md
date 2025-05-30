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
4. The LLMs were able to do some quite significant changes, such as: adding new pages, a task table summary, table sorting and filtering, and table pagination. These were mostly done with a single prompt and it saved me a lot of time compared to doing it myself.
5. The end result is that I have a Productivity app MVP ready for final testing and deployment - I'm fairly confident it's secure, and that the payment process works fine. I also have a 'Go Live' plan to cover the final setup and deployment steps, which could probably be done in a week, but will take until sometime in mid-to-late June due to other commitments.

Overall I think I like using the Cursor IDE and will continue to develop the productivity app as well as a few other ideas I want to follow up on.

Read on if you need more detail, otherwise thanks for reading...

## Fast or Slow

My Pro membership with Cursor AI entitles me to 500 'fast' credits per month, many of which I used up just learning to use the IDE and seeing what it was capable of, so by the time I started using them to produce a real application, I had already burnt through a significant chunk of credits. Having said that, I was able to get two full-stack applications basically working within the first month and within the 500 'fast' credits. 

I was expecting the switch to 'slow' credits to be a painful step down in productivity, but that turned out not to be the case. There is a limit on which LLMs you can use with slow credits, and the responses _are_ noticably slower, but overall I didn't notice any significant problems, and my productivity didn't really suffer.

It's quite possible that my prompting skills had improved to compensate for the slow credits and limited LLMs, so I expect that my next month's fast 500 credits will be more productive than the last. Running out of fast credits doesn't really seem to be an issue as far as I can tell.

You can save a lot of credit wastage by doing simple changes manually, and it's often quicker than using the LLM. One thing I like is to use AI-generated commit comments, although I'm not sure if it uses any credits.

## Avoiding Death Spirals

I saw an article about how Cursor AI chooses what to include in the context window to go along with the prompt, and it appears that it selects the most relevant 250 lines, possibly from different files, and used that to come up with its answers. This may explain why it makes silly mistakes from time to time, since it isn't considering all of the information it really needs. I expect that, over time, context windows will become larger, but there are some things you can do to reduce the likelihood of Death Spirals:

1. As any good programmer knows, keeping files and functions smaller and more self-contained makes the code easier to maintain. This appearst to be the case with AI coding tools as well.
2. Limit the scope of your changes. If you need a wide-ranging refactor, break it up into smaller increments and prompt each one individually. In the long run it will take less time than fighting the LLM to get the results you want, and will also be less frustrating.
3. Become aware of which tasks the LLM can do well and which ones it struggles with. If you're using a new library or framework that the LLM wasn't trained on then you can help by including code examples from the documentation as part of the prompt, so that the LLM has some clues about how to solve the task.

## Playing it Safe

There are few horror stories about application security issues from 'vibe coders', perhaps non-coders, where an application has exposed sensitive information unexpectedly, such as passwords, PII, and API keys. I think the best way to prevent these problems is to code certain features manually.

As an example, originally the LLM implemented its own bespoke code for authentication, email confirmation, etc., and stored them in a table in the same database. Ideally I wanted to keep such things out of my application so I decided to switch to an OAuth framework instead. Unfortunately the AI was unable to cope with this change, at least not to my satisfaction, so I coded it manually and ripped out the original AI code. Now the application uses SSO (e.g. Sign In With Google etc.) and doesn't require user signup, which has several advantages. 

Similarly with Stripe payment integration, I decided to code that manually as well, given the sensitive data that is involved, and this, alongside the OAuth changes means the following:

1. No need to store passwords, so if the app is hacked then this information cannot be stolen.
2. No need to verify user emails as part of a signup process. 
3. Also, since I'm using the email address to identify the user, they can sign in with any supported provider, and if the email address is the same then they login to the same account.
4. No need to store payment or address data, since Stripe handles that within their own system, so if my app is hacked then no payment information can be stolen.
5. The application is simpler because there is no need for a signup page, email verification, or password recovery mechanism.

## Let it Rip

## Productivity App

## Next Steps
