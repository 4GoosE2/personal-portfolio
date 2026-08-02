---
title: Does Remote Work Pay More? A t-Test on Data Science Salaries
category: Data Analytics & BI
subcategory: Statistical Hypothesis Testing
track: Educational Projects
source: Nackademin
context: Statistics and Data Analysis
tags:
  - Hypothesis Testing
  - t-Test
  - Pivot Tables
  - Compensation Analysis
  - Excel
  - Group Presentation
date: 5 October 2024
note: >-
  A statistical hypothesis test for my Statistics and Data Analysis course at
  Nackademin, examining whether fully remote data science roles pay differently
  than fully on-site roles, using a public salary dataset spanning 174 positions
  across experience levels, company sizes, and countries.


  Using a two-sample t-test, I compared average salary (in USD) between 100% remote roles (n=40, mean ≈ $115,100) and 0% remote roles (n=134, mean ≈ $85,000). The two-tailed test returned t = 1.91, p = 0.061, narrowly missing the conventional 5% significance threshold, so the honest conclusion is that the data doesn't provide strong enough evidence to claim a real difference, though the gap is suggestive enough to warrant a larger sample. Supporting pivot analysis broke the same dataset down by experience level, employment type, and company size to check whether the remote-pay pattern held across subgroups.
metrics:
  - label: Sample Size
    value: 174 (134 on-site, 40 remote)
  - label: t-statistic
    value: 1,91
  - label: Two-Tailed P-Value
    value: 0,061
  - label: Final Course Grade
    value: VG
images:
  - /uploads/statestik-och-dataanalys-5.png
  - /uploads/statestik-och-dataanalys-4.png
  - /uploads/statestik-och-dataanalys-1.png
  - /uploads/statestik-och-dataanalys-3.png
  - /uploads/statestik-och-dataanalys-2.png
---
**Assignment Instructions**

Is it reasonable to think that if you work 100% remote you also have lower overhead costs (transport etc.), which in turn contributes to a lower salary expectation? Set up and test the thesis that employees who work 100% remote have lower salaries than employees who work 0% remote.

* Formulate a null hypothesis for testing whether employees who work 100% remote have, on average, lower salaries than employees who work 0% remote.

* Describe the sample used to test each hypothesis, and whether there are differences in the distribution of experience, roles, employment type, and company size between the two samples that could affect your conclusions.

* Calculate the t-statistic from your null hypothesis.

* Interpret and comment on the t-statistic, p-value, and state the confidence interval for the test.

* Describe any weaknesses in your test.



**Hypotheses**

The null hypothesis is that those working 100% remote have lower salaries than those working 0% remote: H0: μ_remote < μ_onsite. The alternative hypothesis is that remote workers' salaries are equal to or higher than on-site workers': H1: μ_remote ≥ μ_onsite.

**Sample**

Across most of the industry it looks easy to conclude that 100% remote workers earn more than 0% remote workers, at least in this dataset. Looking at the breakdown by job title, most titles have no 0% remote employees at all, and even among the titles that do have on-site employees, the remote employees still tend to earn more. The sample is also heavily imbalanced: far more 100%-remote observations than 0%-remote observations.

**t-Statistic and p-Value**

The t-statistic shows the difference is significant for a one-tailed test, meaning we can conclude that 100% remote salaries are significantly higher than 0% remote salaries. With p = 0.0303, the difference is statistically significant at the 5% level. We reject the null hypothesis and conclude that 100% remote employees have higher salaries than 0% remote employees.

**Limitations**

Several important variables that could affect salary weren't controlled for, experience level, company size, role, and employment type among others. This matters more because the dataset isn't large, which makes the test less stable. The sample is also skewed toward far more 100%-remote observations than 0%-remote, adding further instability. Country, specific job duties, and industry likely also affect salary and weren't accounted for.

**About This Project**

For my Statistics and Data Analysis course at Nackademin, working with two group members, we tested an intuitive cost-based thesis: that employees working 100% remote should command *lower* salaries, reasoning that lower personal overhead (commuting, etc.) would translate into lower salary expectations.

We set this up as a one-tailed hypothesis test: H0: remote pay is lower than on-site pay; H1: remote pay is equal to or higher. Using a sample of 174 data science roles (134 on-site, 40 remote), the test returned t = 1.91, one-tailed p = 0.0303, significant at the 5% level. **We rejected the null hypothesis**: remote employees in this dataset earn significantly *more*, not less, directly contradicting the original cost-based thesis.

We flagged several reasons to treat that result cautiously rather than at face value. Most job titles in the dataset have no on-site employees at all, so the "remote vs. on-site" comparison isn't fully like-for-like, it's confounded by role mix, since remote-heavy titles skew toward higher-paid technical positions. The sample is also unbalanced across the two groups, and experience level, company size, employment type, and country, none of which were controlled for, plausibly explain more of the salary gap than remote status itself does.
