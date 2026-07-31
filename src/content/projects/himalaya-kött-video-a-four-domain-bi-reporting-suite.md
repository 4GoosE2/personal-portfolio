---
title: "Himalaya Kött & Video: A Four-Domain BI Reporting Suite"
category: Data Analytics & BI
subcategory: Requirements-Driven Dashboard Design
track: Educational Projects
source: Nackademin
context: Systems Understanding and Business Processes in BI
tags:
  - Power BI
  - DAX
  - Dashboard Design
  - Requirements Specification
  - Sales Analytics
  - HR Analytics
  - "Financial Reporting "
  - Drill-Down
date: 7 November 2023
note: >-
  This was my first major Power BI project for my Systems Understanding and
  Business Processes in BI course at Nackademin, building a full annual
  reporting suite for a fictional retail company (Himalaya Kött & Video)
  directly from four formal requirements specifications covering Sales, HR,
  Campaigns, and Finance.


  The report spans a navigable home page and eight report pages across the four domains: sales performance broken down by department, product group, and individual SKU with best/worst performer rankings; HR tracking of headcount, demographics, hours worked, and salary-to-tenure correlation; campaign analysis comparing discounted pricing against margin impact; and a full income statement with monthly and YTD views. Each section includes drill-down hierarchies and cross-filtering, built to match the specific analytical requirements laid out in the brief rather than a generic dashboard template.


  Revisiting it now, a few things stand out I'd do differently: several table columns lack clear labels that made sense at the time but aren't self-explanatory on review, and the sales time-span filtering could offer more granular options than what's currently built in. I've left the build as originally submitted rather than polishing it retroactively, since the self-assessment is itself part of an honest look back at early BI work.
metrics:
  - label: Annual Result
    value: 213M
  - label: TG% (margin)
    value: 22,5%
  - label: Employees Tracked
    value: "19"
images: []
---
**About this project**

This was my first major Power BI build for my Systemförståelse och verksamhetsprocesser inom BI course at Nackademin: a full annual reporting suite for a fictional retail company, Himalaya Kött & Video, built directly from four formal requirements specifications covering Sales, HR, Campaigns, and Finance. Rather than exploring data freely, the brief required translating each specification's stated data and analysis needs into working report pages, closer to how a BI analyst would work from a stakeholder request than a typical coursework exercise.

**Visual identity and navigation**

The color palette, layout system, and logo are all custom, including the "Himalaya Kött & Video" mark itself and the four category icons (a growth chart for Finance, an HR silhouette, a speech-bubble pair for Campaigns, and a money bag for Sales) that appear consistently across every page as the primary navigation. On the home page, navigation sits along the top; on every subsequent page it moves to the left-hand rail, with page-specific filters and "continue to next page" controls kept at the top instead, a deliberate consistency choice so a user always knows where global navigation lives versus page-level controls. The home page's images are also clickable, functioning as an additional navigation layer alongside the icon rail.

**Sales**

Page one is built around a detailed product table (PPU, margin in both kr and %, total sales per SKU), paired with two ranked bar charts surfacing the 5 best and 5 worst performing products, directly answering the requirement to identify top and bottom contributors at the product level. Page two extends this with dual line charts comparing sales trends across two different time granularities side by side, plus a toggle to switch the entire view between department-level and product-group-level aggregation without duplicating pages, one flexible view rather than several static ones.

**HR**

Page one tracks headcount growth over time, a gender-distribution donut chart, and a full employee table, filterable by gender, employment type, and age range via a slider. It also includes a genuine drill-down hierarchy, filtering by role category with the ability to expand into individual employees, directly matching the spec's requirement to move from "highest to lowest level." Page two adds an hours-worked column chart per employee (filterable by month), an average-hours summary table, and a scatter chart plotting salary against tenure, a specific analytical requirement from the brief (how years employed correlates with pay) that a simple table couldn't answer on its own.

**Campaigns**

The core of this page is a matrix showing original price, discounted price, discount amount, resulting margin, and units sold, filterable by month and by specific campaign. Below it, two bar charts rank the 5 best and 5 worst campaigns by margin impact, with a written insight callout identifying which specific campaign (week 30, "K30") generated the strongest margin and why, showing the analysis extends beyond the visual into an actual written finding.

**Finance**

Page one is the detail view: a full monthly and YTD breakdown of TB1, TB2, HR costs, purchasing costs, revenue, and other costs, with a summed total row and a month filter, exactly matching the spec's requirement for a simple income statement with YTD tracking. Page two simplifies the same data into a single summarized matrix for a faster read, alongside a line chart and column chart showing how the annual result moved across the year, and a dynamic callout ("Highest month: December, Result: 21,442,769") that updates based on the data rather than being hardcoded.

**Looking back**

Revisiting this now, a few things stand out I'd do differently: several table columns lack clear labels that made sense to me at the time but aren't self-explanatory to a new viewer, and the Sales time-span filtering could offer more granular date options than what's currently built in. I've kept the build as originally submitted rather than polishing it retroactively, since an honest look back at early work is more useful here than a quiet touch-up.
