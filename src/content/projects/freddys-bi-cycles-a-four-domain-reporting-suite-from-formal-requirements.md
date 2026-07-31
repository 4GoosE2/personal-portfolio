---
title: "Freddy's BI-Cycles: A Four-Domain Reporting Suite from Formal Requirements"
category: Data Analytics & BI
subcategory: Requirements-Driven Dashboard Design
track: Educational Projects
source: Nackademin
context: Systems Understanding and Business Processes in BI
tags: []
date: 7 November 2023
note: >-
  A second full BI build from my Systems Understanding and Business Processes in
  BI course at Nackademin, this time for a fictional company, Freddy's
  BI-cycles, again built directly from formal requirements specifications rather
  than open-ended exploration.


  The brief spanned four domains: Sales analysis with drill-down from category to product, R12/YTD/actuals views, and country/continent breakdowns with currency handling; HR covering headcount by department, tenure, gender distribution across organizational levels, turnover rate, and a reporting hierarchy; Inventory, tracking stock value, turnover velocity, top-value and top-volume products, and delivery scheduling; and Finance, a full income statement with budget-versus-actual comparison down to account level, consolidated and by legal entity.


  Each report page maps to a specific line item in the requirements document, an exercise in translating stakeholder asks into working visuals rather than just demonstrating Power BI features.
metrics:
  - label: Domains Covered
    value: 4 (Sales, HR, Inventory, Finance)
  - label: Reporting periods supported
    value: Montly, YTD, R12, Quarterly
cover: /uploads/.gitkeep
images:
  - /uploads/ekonomi.png
  - /uploads/hr1.png
  - /uploads/hr2.png
  - /uploads/lager-1.png
  - /uploads/sales-1.png
  - /uploads/sales-2.png
---
**About this project**

This was my second major Power BI build for my Systems Understanding and Business Processes in BI course at Nackademin, again for a fictional company, Freddy's BI-cycles, built directly from three formal requirements documents covering Sales, HR/Inventory, and Finance.

**Visual identity**

The palette and component design are fully custom for this build: a warm coral-red theme (distinct from Himalaya's blue palette), with rounded card panels, a consistent left-hand icon rail for cross-report navigation (Sales, HR, Campaigns/Messages, Finance), and a "Meny" button on every page returning to the landing view. The same navigation discipline carries over from the earlier build, global navigation stays fixed in position across pages, page-specific filters sit at the top.

**Sales**

Page one leads with six KPI cards (total orders, total sales, total margin, average sales per day, total cost, margin %), directly answering the requirement for a KPI summary. Below that, two donut charts break sales down by product colour and by country, both explicit line items from the requirements brief, and two line charts track rolling 12-month sales and YTD sales side by side, again matching the brief's specific ask for both R12 and YTD views in the same view. The right-hand rail holds a subcategory filter tree and a year filter, both persistent across the page.

Page two shifts to a detailed matrix, product subcategory broken down by internet and reseller channel (sales, cost, margin, in both currencies as required), with a total row. Below it, a world map plots sales by country and a second line chart tracks average daily sales, fulfilling the brief's requirement for geographic visualisation and daily-level trend analysis in one page.

**HR**

Page one opens with a world map of employee locations, then three donut charts covering department headcount, gender distribution, and geographic distribution by sales territory, each with full legends. Below that, a searchable employee table (name, age, phone, title, department) sits beside a large "290" headcount figure. The right-hand rail carries a genuine organisational hierarchy filter, department categories that expand down to individual roles, directly satisfying the brief's requirement to drill from department level to individual employee.

**Inventory**

Built to answer the brief's stock-value, turnover, and delivery-tracking requirements: current stock value, top-5 products by volume and by value, average inventory value calculation, and inventory turnover rate, alongside delivery-day tracking for incoming stock.

**Finance**

Structured around the brief's income statement requirement: revenue and cost totals down to account level, budget-versus-actual comparison, and the ability to view results by individual legal entity or consolidated, with both monthly actuals and YTD tracking, and currency handled per the requirement to either offer a currency toggle or convert automatically.
