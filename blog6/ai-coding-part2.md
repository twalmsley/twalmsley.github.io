# AI Coding Part 2

> _This blog post and its mistakes are (almost) entirely human-generated_
> _(The Deployment Plan at the end is from ChatGPT)_

## The Story So Far

In the previous [Blog Post](../blog5/blog5.html) I described an experiment to develop a basic but functional web application using the Cursor AI IDE, and discussed some of the difficulties and successes along the way. In this update I cover a few extra points that have come up in the time since my last post:

1. Running out of fast credits in the IDE.
2. Manual updates where the AI models weren't able to cope.
3. Manual updates for security reasons.
4. AI updates where things went well.
5. The productivity web application MVP.
6. Do I think AI coding is all hype?

## Bottom Line Up Front

For those with short attention spans, here is the bottom line for each point:

1. Slow credits were fine, I didn't notice too much of a reduction in productivity.
2. Some wide-ranging refactors I asked for were too big for the LLM's context window, so it tends to mess up pretty badly for these cases. Filtering a task list by date to show 'today's tasks', 'tasks this week', and 'tasks this month' had to be done manually using the 'data-fns' library, because the LLM just could not generate correctly functioning code, which was frustrating.
3. Switching authentication to a library rather than custom code, and adding Stripe integration were too important to leave to the AI. You really need to know what's going on with the code here, so it's best done manually - and it wasn't difficult.
4. The LLMs were able to do some quite significant changes, such as: adding new pages, a task table summary, table sorting and filtering, and table pagination. These were mostly done with a single prompt and it saved me a lot of time compared to doing it myself.
5. The end result is that I have a Productivity app MVP ready for final testing and deployment - I'm fairly confident it's secure, and that the payment process works fine. I also have a 'Go Live' plan to cover the final setup and deployment steps, which could probably be done in a week, but will take until sometime in mid-to-late June due to other commitments.
6. It's not all hype - you really can make great productivity gains _if_ you take the time to understand the limitations.

Overall I think I like using the Cursor IDE and will continue to develop the productivity app as well as a few other ideas I want to follow up on.

Read on if you need more detail, otherwise thanks for reading...

## Fast or Slow Credits

My Pro membership with Cursor AI entitles me to 500 'fast' credits per month, many of which I used up just learning to use the IDE and seeing what it was capable of, so by the time I started using them to produce a real application, I had already burnt through a significant chunk of credits. Having said that, I was able to get two full-stack applications basically working within the first month and within the 500 'fast' credits. 

I was expecting the switch to 'slow' credits to be a painful step down in productivity, but that turned out not to be the case. There is a limit on which LLMs you can use with slow credits, and the responses _are_ noticably slower, but overall I didn't notice any significant problems, and my productivity didn't really suffer.

It's quite possible that my prompting skills had improved to compensate for the slow credits and limited LLMs, so I expect that my next month's fast 500 credits will be more productive than the last. Running out of fast credits doesn't really seem to be an issue as far as I can tell.

You can save a lot of credit wastage by doing simple changes manually, and it's often quicker than using the LLM. One thing I like is to use AI-generated commit comments, although I'm not sure if it uses any credits.

## Avoiding Death Spirals

I saw an article about how Cursor AI chooses what to include in the context window to go along with the prompt, and it appears that it selects the most relevant 250 lines, possibly from different files, and used that to come up with its answers. This may explain why it makes silly mistakes from time to time, since it isn't considering all of the information it really needs. I expect that, over time, context windows will become larger, but there are some things you can do to reduce the likelihood of Death Spirals:

1. As any good programmer knows, keeping files and functions smaller and more self-contained makes the code easier to maintain. This appears to be the case with AI coding tools as well.
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

## Letting It Rip

In many cases the AI-generated code was fine, especially in the areas of page design, i.e. HTML, CSS, Tailwind, and, since I find those areas tedious and time consuming, I was happy to let the tools produce these, with only minor tweaks from me.

One feature that Cursor added completely, from front end to back end, was the user settings page, which it generated using sliders, and added the back-end code to perist in a new table, which it also created. This feature took less than two minutes and probably saved me half a day's work.

## Productivity App

The AI-coding experiment started out as just that - an experiment, but I was able to produce a functioning MVP for a Productivity web application, which I now feel vested in, so I'm going to continue with it by setting up a domain name and deploying to AWS in the next week or two. It will then be available for a 14-day trial followed by a monthly or yearly subscription. Once it is live, I will start adding features and publicising the updates. The MVP supports a fairly simple-but-powerful task management process aimed at personal users, but it could also be used to manage work tasks by individuals; it is not intended to be a general task management application for teams of people. I'm looking forward to getting it out there so I can see whether anyone will actually use it. Watch this space.

## Is It All Hype?

Not all of it, but as you can imagine, there are many tasks that the tools can't currently help with, such as tasks in the 'go live' plan that I asked ChatGPT to produce, which contains upwards of 40 manual steps: from setting up the database with backups, to registering a domain name and setting up a support email address. I doubt Cursor AI will be able to help much with these tasks beyond giving me detailed step-by-step instructions, which shouldn't be needed anyway because I've deployed similar applications to AWS before. It will be some Docker images hosted in ECS with a domain name on Route53 - some of these steps can be tricky, but they're not very difficult.

AI coding will allow you to produce an MVP quickly and manual deployment will make it available to customers within a couple of weeks if you have a suitable idea and know how you want it to work. This should mean you can 'fail fast' and just drop an application if it doesn't do well, then you can move on to another idea quickly without too much wasted effort.

## Next Steps

To finish off I'll include the 'go live' plan from ChatGPT so you can see just how much work is left to do, which is almost all manual, and which shows that AI coding can only get you part of the way:

# 🚀 Go Live Plan

## 1. Infrastructure & Database Setup
- [ ] Create PostgreSQL DB on AWS RDS (enable backups and auto-failover)
- [ ] Write and test backup/restore scripts or snapshots
- [ ] Generate Prisma schema and run `prisma migrate deploy`
- [ ] Set up read replicas (optional)

## 2. Container & App Deployment
- [ ] Build Docker image and push to Amazon ECR
- [ ] Define ECS task definition and service (Fargate)
- [ ] Configure IAM roles and security groups
- [ ] Deploy app to ECS
- [ ] Connect ECS to RDS securely (VPC, subnets, SGs)
- [ ] Connect app to Stripe sandbox and validate keys
- [ ] Ensure OAuth callback URLs are properly whitelisted

## 3. Networking & Domain
- [ ] Register/manage domain
- [ ] Set up HTTPS via AWS Certificate Manager
- [ ] Configure Application Load Balancer + redirect to HTTPS
- [ ] Set DNS entries in Route 53

## 4. Email & Notifications
- [ ] Set up SendGrid and verify sender domain
- [ ] Add retry + rate limit logic to ContactUs form
- [ ] Send test emails and verify deliverability

## 5. Stripe Configuration
- [ ] Replicate test products into live Stripe account
- [ ] Replace test keys with live keys in environment
- [ ] Run end-to-end payment test in live mode (low value)

## 6. Observability & Monitoring
- [ ] Enable CloudWatch logs for ECS tasks
- [ ] Add metrics: CPU, memory, HTTP errors
- [ ] Configure alerts for health checks and failures
- [ ] Integrate error tracking (e.g. Sentry)

## 7. Security & Compliance
- [ ] Audit IAM roles (least-privilege principle)
- [ ] Enforce HTTPS throughout
- [ ] Enable WAF for public endpoints
- [ ] Verify Stripe webhook signature
- [ ] Add rate-limiting on sensitive endpoints

## 8. QA & Manual Testing
- [ ] Cross-browser and mobile device testing
- [ ] Run performance/load test (20–100 users)
- [ ] Test horizontal scaling with ECS task increase
- [ ] Manually test login, payments, contact form, logout, etc.

## 9. Internal Pilot
- [ ] Use the app daily for 7–10 days
- [ ] Share access with trusted users (private beta)
- [ ] Collect and review bug reports and feedback

## 10. Launch
- [ ] Publish Google OAuth client endpoint
- [ ] Switch Stripe to live mode
- [ ] Take final RDS snapshot before launch
- [ ] Clear out any test data from prod DB
- [ ] Monitor metrics and logs closely post-launch

## 11. Post-Launch Maintenance
- [ ] Set up weekly backups + log review
- [ ] Schedule regular security/dep updates
- [ ] Add bug/feature request form for users
- [ ] Define planned downtime procedure
