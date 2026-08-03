---
title: Building a Dimensional Data Warehouse for Purchase Order Analysis
category: Data Analytics & BI
subcategory: Data Warehousing & ETL Pipeline Design
track: Educational Projects
source: Nackademin
context: SQL
tags:
  - SQL
  - T-SQL
  - ETL
  - Star Schema
  - Dimensional Modeling
  - Data Warehouse
  - SQL Server Agent
date: 26 Mars 2024
note: >-
  This was my final project for the SQL course in my Business Intelligence
  program at Nackademin, building a complete ETL pipeline and dimensional data
  warehouse from source to star schema.


  Data flows through three layers: a staging area (Sit) that ingests raw AdventureWorks2019 tables via bulk insert, a cleansed staging layer (Stt) that resolves data types, nulls, and duplicates through MERGE-based upserts, and a final data mart (Dmt/Dmv) structured as a proper star schema, four dimension tables (Product, Vendor, Ship Method, Purchase Order Header) plus a Date dimension, surrounding a Purchase Order Detail fact table. The fact table's grain is a single purchase order line item, each row representing one product ordered on one purchase order.


  The pipeline handles SCD Type 1 updates (new and changed dimension records upsert cleanly without duplication), replaces missing values with dedicated "unknown" reference rows rather than nulls, and connects fact to dimensions via surrogate keys. The entire load, staging through data mart, is automated as a single SQL Server Agent job, and the resulting star schema connects directly to Power BI for reporting.
metrics:
  - label: Grain
    value: one row per purchase order line item
  - label: Schema
    value: 4 dimensions + 1 fact table
  - label: Pipeline
    value: fully automated via SQL Server Agent job
  - label: Grade
    value: VG
cover: /uploads/skarmbild_2024-03-15_195843.png
---
### EXPLANATION

Fact table: PurchaseOrderDetail   Grain: one row per purchase order line item, i.e. one specific product ordered   on one specific purchase order. Each row represents the real-world event of   a single product being included as a line on a purchase order sent to a vendor.    

Star schema: 4 dimensions (Product, Vendor, ShipMethod, PurchaseOrderHeader)   + 1 Date dimension, surrounding the PurchaseOrderDetail fact table.    

Pipeline: Sit (raw source landing) -> Stt (cleansed, typed, upserted) ->   Dmt/Dmv (final star-schema data mart + views), fully automated via a   SQL Server Agent job.

### CREATION SCRIPTS — STAGING 

```
USE BI23_Stage
GO
 
CREATE TABLE [Stt].[Product](
	[ProductSK] [int] IDENTITY(1,1) NOT NULL,
	[ProductID] [int] NOT NULL,
	[Name] [nvarchar](50) NOT NULL,
	[ProductNumber] [nvarchar](25) NOT NULL,
	[MakeFlag] [bit] NOT NULL,
	[FinishedGoodsFlag] [bit] NOT NULL,
	[Color] [nvarchar](15) NULL,
	[SafetyStockLevel] [smallint] NOT NULL,
	[ReorderPoint] [smallint] NOT NULL,
	[StandardCost] [money] NOT NULL,
	[ListPrice] [money] NOT NULL,
	[Size] [nvarchar](5) NULL,
	[SizeUnitMeasureCode] [nchar](3) NULL,
	[WeightUnitMeasureCode] [nchar](3) NULL,
	[Weight] [decimal](8, 2) NULL,
	[DaysToManufacture] [int] NOT NULL,
	[ProductLine] [nchar](2) NULL,
	[Class] [nchar](2) NULL,
	[Style] [nchar](2) NULL,
	[ProductSubcategoryID] [int] NULL,
	[ProductModelID] [int] NULL,
	[SellStartDate] [datetime] NOT NULL,
	[SellEndDate] [datetime] NULL,
	[DiscontinuedDate] [datetime] NULL,
	[rowguid] [uniqueidentifier] ROWGUIDCOL NOT NULL,
	[ModifiedDate] [datetime] NOT NULL,
	[audit_ts] DATETIME DEFAULT GETDATE()
	);
 
SET IDENTITY_INSERT BI23_Stage.Stt.Product ON;
 
INSERT INTO [BI23_Stage].[Stt].[Product](
    [ProductSK], [ProductID], [Name], [ProductNumber], [MakeFlag], [FinishedGoodsFlag], [Color],
    [SafetyStockLevel], [ReorderPoint], [StandardCost], [ListPrice], [Size], [SizeUnitMeasureCode],
    [WeightUnitMeasureCode], [Weight], [DaysToManufacture], [ProductLine], [Class], [Style],
    [ProductSubcategoryID], [ProductModelID], [SellStartDate], [SellEndDate], [DiscontinuedDate], 
    [rowguid], [ModifiedDate]
)
VALUES
(-1, -1, 'NA', 'NA', 0, 0, 'NA', -1, -1, -1.00, -1.00, 'NA', 'NA', 'NA', -1.00, -1, 'NA', 'NA', 'NA', -1, -1,
'2000-01-01','2000-01-01', '2000-01-01', '00000000-0000-0000-0000-000000000000', '2000-01-01');
 
SET IDENTITY_INSERT BI23_Stage.Stt.Product OFF;
 
CREATE TABLE [BI23_STAGE].[Stt].[Vendor](
    [VendorSK] [int] IDENTITY(1,1) NOT NULL,
	[VendorID] [int] NOT NULL,
	[AccountNumber] [nvarchar](15) NOT NULL,
	[Name] [nvarchar](50) NOT NULL,
	[CreditRating] [tinyint] NOT NULL,
	[PreferredVendorStatus] [bit] NOT NULL,
	[ActiveFlag] [bit] NOT NULL,
	[PurchasingWebServiceURL] [nvarchar](1024) NULL,
	[ModifiedDate] [datetime] NOT NULL,
	[audit_ts] DATETIME DEFAULT GETDATE()
	);
 
SET IDENTITY_INSERT BI23_Stage.Stt.Vendor ON;
 
INSERT INTO [BI23_Stage].[Stt].[Vendor](
	[VendorSK], [VendorID], [AccountNumber], [Name], [CreditRating], [PreferredVendorStatus],
	[ActiveFlag], [PurchasingWebServiceURL], [ModifiedDate]
)
VALUES
(-1, -1, 'NA', 'NA', 0, 0, 0, 'NA', '2000-01-01');
 
SET IDENTITY_INSERT BI23_Stage.Stt.Vendor OFF;
 
CREATE TABLE [BI23_Stage].[Stt].[ShipMethod](
    [ShipMethodSK] [int] IDENTITY(1,1) NOT NULL,
    [ShipMethodID] [int] NOT NULL,
	[Name] [nvarchar](50) NOT NULL,
	[ShipBase] [money] NOT NULL,
	[ShipRate] [money] NOT NULL,
	[rowguid] [uniqueidentifier] ROWGUIDCOL  NOT NULL,
	[ModifiedDate] [datetime] NOT NULL,
	[audit_ts] DATETIME DEFAULT GETDATE()
	);
 
SET IDENTITY_INSERT BI23_Stage.Stt.ShipMethod ON;
 
INSERT INTO [BI23_Stage].[Stt].[ShipMethod](   
	[ShipMethodSK], [ShipMethodID], [Name], [ShipBase], [ShipRate], [rowguid], [ModifiedDate]
)
VALUES
(-1, -1, 'NA', -1.00, -1.00, '00000000-0000-0000-0000-000000000000', '2000-01-01');
 
SET IDENTITY_INSERT BI23_Stage.Stt.ShipMethod OFF;
GO
 
CREATE TABLE [BI23_Stage].[Stt].[PurchaseOrderHeader](
    [PurchaseOrderHeaderSK] [int] IDENTITY(1,1) NOT NULL,
	[PurchaseOrderID] [int] NOT NULL,
	[RevisionNumber] [tinyint] NOT NULL,
	[Status] [tinyint] NOT NULL,
	[EmployeeID] [int] NOT NULL,
	[VendorID] [int] NOT NULL,
	[ShipMethodID] [int] NOT NULL,
	[OrderDate] [datetime] NOT NULL,
	[ShipDate] [datetime] NULL,
	[SubTotal] [money] NOT NULL,
	[TaxAmt] [money] NOT NULL,
	[Freight] [money] NOT NULL,
	[TotalDue]  AS (isnull(([SubTotal]+[TaxAmt])+[Freight],(0))) PERSISTED NOT NULL,
	[ModifiedDate] [datetime] NOT NULL,
	[audit_ts] DATETIME DEFAULT GETDATE()
	);
 
SET IDENTITY_INSERT BI23_Stage.Stt.PurchaseOrderHeader ON;
 
INSERT INTO [BI23_Stage].[Stt].[PurchaseOrderHeader](
	[PurchaseOrderHeaderSK], [PurchaseOrderID], [RevisionNumber], [Status], [EmployeeID],
	[VendorID], [ShipMethodID], [OrderDate], [ShipDate], [SubTotal], [TaxAmt], [Freight], [ModifiedDate]
)
VALUES
(-1, -1, 0, 0, -1, -1, -1, '2000-01-01', '2000-01-01', -1.00, -1.00, -1.00, '2000-01-01') 
 
SET IDENTITY_INSERT BI23_Stage.Stt.PurchaseOrderHeader OFF;
 
CREATE TABLE [BI23_Stage].[Stt].[PurchaseOrderDetail](
	[PurchaseOrderDetailSK] [int] IDENTITY (1,1) NOT NULL,
	[PurchaseOrderID] [int] NOT NULL,
	[PurchaseOrderDetailID] [int] NOT NULL,
	[DueDate] int NOT NULL,
	[OrderQty] [smallint] NOT NULL,
	[ProductID] [int] NOT NULL,
	[UnitPrice] [money] NOT NULL,
	[LineTotal]  AS (isnull([OrderQty]*[UnitPrice],(0.00))),
	[ReceivedQty] [decimal](8, 2) NOT NULL,
	[RejectedQty] [decimal](8, 2) NOT NULL,
	[StockedQty]  AS (isnull([ReceivedQty]-[RejectedQty],(0.00))),
	[ModifiedDate] [datetime] NOT NULL,
	[audit_ts] DATETIME DEFAULT GETDATE()
	);
 
SET IDENTITY_INSERT BI23_Stage.Stt.PurchaseOrderDetail ON;
 
INSERT INTO [BI23_Stage].[Stt].[PurchaseOrderDetail](
	[PurchaseOrderDetailSK], [PurchaseOrderID], [PurchaseOrderDetailID], [DueDate], [OrderQty],
	[ProductID], [UnitPrice], [ReceivedQty], [RejectedQty], [ModifiedDate])
VALUES
(-1, -1, -1, 20000101, 0, -1, -1.00, -1.00, -1.00, '2000-01-01')
 
SET IDENTITY_INSERT BI23_Stage.Stt.PurchaseOrderDetail OFF;
 
ALTER TABLE [BI23_Stage].[Stt].[PurchaseOrderDetail]
ADD VendorID INT, ShipMethodID INT;
```

### CREATION SCRIPTS — DATA WAREHOUSE

```
USE BI23_DM
GO
 
CREATE TABLE Dmt.DimDate 
(
    DateKey INT NOT NULL,
    DateFull DATE NOT NULL,
    Year INT NOT NULL,
    Quarter INT NOT NULL,
    Month INT NOT NULL,
    DayOfMonth INT NOT NULL,
    DayOfWeekName VARCHAR(10) NOT NULL,
    DayOfWeek INT NOT NULL,
    MonthName VARCHAR(10) NOT NULL,
    IsWeekend BIT NOT NULL,
    IsHoliday BIT NOT NULL
);
 
DECLARE @StartDate DATE = '2000-01-01';
DECLARE @EndDate DATE = '2030-12-31';
 
;WITH DateCTE AS (
    SELECT @StartDate AS DateValue
    UNION ALL
    SELECT DATEADD(DAY, 1, DateValue)
    FROM DateCTE
    WHERE DateValue < @EndDate
)
INSERT INTO Dmt.DimDate (DateKey, DateFull, Year, Quarter, Month, DayOfMonth, DayOfWeekName, DayOfWeek, MonthName, IsWeekend, IsHoliday)
SELECT
    CONVERT(INT, REPLACE(CONVERT(VARCHAR, DateValue, 112), '-', '')) AS DateKey,
    DateValue AS DateFull, YEAR(DateValue) AS Year, DATEPART(QUARTER, DateValue) AS Quarter, MONTH(DateValue) AS Month,
    DAY(DateValue) AS DayOfMonth, DATENAME(WEEKDAY, DateValue) AS DayOfWeekName, DATEPART(WEEKDAY, DateValue) AS DayOfWeek,
    DATENAME(MONTH, DateValue) AS MonthName,
    CASE WHEN DATEPART(WEEKDAY, DateValue) IN (1, 7) THEN 1 ELSE 0 END AS IsWeekend,
    0 AS IsHoliday
FROM DateCTE
OPTION (MAXRECURSION 0);
 
CREATE TABLE [Dmt].[FactPurchaseOrderDetail](
	[PurchaseOrderDetailSK] [int] NOT NULL,
	[PurchaseOrderID] [int] NOT NULL,
	[PurchaseOrderDetailID] [int] NOT NULL,
	[DueDate] [int] NOT NULL,
	[OrderQty] [smallint] NOT NULL,
	[ProductID] [int] NOT NULL,
	[UnitPrice] [money] NOT NULL,
	[LineTotal] [money] NULL,
	[ReceivedQty] [decimal](8, 2) NOT NULL,
	[RejectedQty] [decimal](8, 2) NOT NULL,
	[StockedQty] [int] NULL,
	[ModifiedDate] [datetime] NOT NULL,
	[audit_ts] [DATETIME] DEFAULT GETDATE(),
	[VendorID] [int] NULL,
	[ShipMethodID] [int] NULL,
);
 
CREATE TABLE [Dmt].[DimProduct](
	[ProductSK] [int] NOT NULL, [ProductID] [int] NOT NULL, [Name] [nvarchar](50) NOT NULL,
	[ProductNumber] [nvarchar](25) NOT NULL, [MakeFlag] [bit] NOT NULL, [FinishedGoodsFlag] [bit] NOT NULL,
	[Color] [nvarchar](15) NULL, [SafetyStockLevel] [smallint] NOT NULL, [ReorderPoint] [smallint] NOT NULL,
	[StandardCost] [money] NOT NULL, [ListPrice] [money] NOT NULL, [Size] [nvarchar](5) NULL,
	[SizeUnitMeasureCode] [nchar](3) NULL, [WeightUnitMeasureCode] [nchar](3) NULL, [Weight] [decimal](8, 2) NULL,
	[DaysToManufacture] [int] NOT NULL, [ProductLine] [nchar](2) NULL, [Class] [nchar](2) NULL, [Style] [nchar](2) NULL,
	[ProductSubcategoryID] [int] NULL, [ProductModelID] [int] NULL, [SellStartDate] [datetime] NOT NULL,
	[SellEndDate] [datetime] NULL, [DiscontinuedDate] [datetime] NULL, [rowguid] [uniqueidentifier] ROWGUIDCOL NOT NULL,
	[ModifiedDate] [datetime] NOT NULL, [audit_ts] DATETIME DEFAULT GETDATE()
);
 
CREATE TABLE [Dmt].[DimVendor](
	[VendorSK] [int] NOT NULL, [VendorID] [int] NOT NULL, [AccountNumber] [nvarchar](15) NOT NULL,
	[Name] [nvarchar](50) NOT NULL, [CreditRating] [tinyint] NOT NULL, [PreferredVendorStatus] [bit] NOT NULL,
	[ActiveFlag] [bit] NOT NULL, [PurchasingWebServiceURL] [nvarchar](1024) NULL, [ModifiedDate] [datetime] NOT NULL,
	[audit_ts] DATETIME DEFAULT GETDATE()
);
 
CREATE TABLE [Dmt].[DimShipMethod](
	[ShipMethodSK] [int] NOT NULL, [ShipMethodID] [int] NOT NULL, [Name] [nvarchar](50) NOT NULL,
	[ShipBase] [money] NOT NULL, [ShipRate] [money] NOT NULL, [rowguid] [uniqueidentifier] ROWGUIDCOL NOT NULL,
	[ModifiedDate] [datetime] NOT NULL, [audit_ts] DATETIME DEFAULT GETDATE()
);
 
CREATE TABLE [Dmt].[DimPurchaseOrderHeader](
	[PurchaseOrderHeaderSK] [int] NOT NULL, [PurchaseOrderID] [int] NOT NULL, [RevisionNumber] [tinyint] NOT NULL,
	[Status] [tinyint] NOT NULL, [EmployeeID] [int] NOT NULL, [VendorID] [int] NOT NULL, [ShipMethodID] [int] NOT NULL,
	[OrderDate] [datetime] NOT NULL, [ShipDate] [datetime] NULL, [SubTotal] [money] NOT NULL, [TaxAmt] [money] NOT NULL,
	[Freight] [money] NOT NULL, [TotalDue]  AS (isnull(([SubTotal]+[TaxAmt])+[Freight],(0))) PERSISTED NOT NULL,
	[ModifiedDate] [datetime] NOT NULL, [audit_ts] DATETIME DEFAULT GETDATE()
);
 
--PKs
ALTER TABLE Dmt.DimProduct ADD CONSTRAINT PK_ProductID PRIMARY KEY (ProductID);
ALTER TABLE Dmt.DimVendor ADD CONSTRAINT PK_Vendor PRIMARY KEY (VendorID);
ALTER TABLE Dmt.DimShipMethod ADD CONSTRAINT PK_ShipMethod PRIMARY KEY (ShipMethodID);
ALTER TABLE Dmt.DimPurchaseOrderHeader ADD CONSTRAINT PK_PurchaseOrderID PRIMARY KEY (PurchaseOrderID);
ALTER TABLE Dmt.FactPurchaseOrderDetail ADD CONSTRAINT PK_PurchaseOrderDetailID PRIMARY KEY (PurchaseOrderDetailID);
ALTER TABLE Dmt.Dimdate ADD CONSTRAINT PK_Date PRIMARY KEY (DateKey);
 
--Views
CREATE SCHEMA Dmv
GO
 
CREATE VIEW Dmv.DimProduct AS
SELECT
    ProductID, Name, ProductNumber, Color, SafetyStockLevel, ReorderPoint, StandardCost, ListPrice, Size,
    CASE WHEN Style = '"M' THEN 'MALE' WHEN Style = '"W' THEN 'WOMAN' WHEN Style = '"U' THEN 'UNISEX' ELSE 'NA' END AS Style,
    CASE WHEN SellEndDate != '2000-01-01 00:00:00.000' THEN 'No Longer Sold' ELSE 'Available' END AS ProductStatus
FROM Dmt.DimProduct
GO
 
CREATE VIEW Dmv.DimShipMethod AS
SELECT ShipMethodID, Name, ShipBase, ShipRate, rowguid AS Hash, audit_ts
FROM Dmt.DimShipMethod;
GO
 
CREATE VIEW Dmv.DimVendor AS
SELECT
    VendorID, AccountNumber, Name AS CompanyName, CreditRating,
	CASE WHEN PreferredVendorStatus = 0 THEN 'No Good' ELSE 'Good' END AS PreferredVendorStatus,
	CASE WHEN ActiveFlag = 0 THEN 'NO' ELSE 'YES' END AS isActive, ModifiedDate
FROM Dmt.DimVendor
GO
 
CREATE VIEW Dmv.DimPurchaseOrderHeader AS
SELECT PurchaseOrderID, RevisionNumber, Status, SubTotal, TaxAmt, Freight, TotalDue, OrderDate, ShipDate
FROM Dmt.DimPurchaseOrderHeader;
GO
 
CREATE VIEW Dmv.FactPurchaseOrderDetail AS
SELECT
    POD.PurchaseOrderID, POD.VendorID, POD.ShipMethodID, POD.ProductID, POD.UnitPrice, POD.OrderQty, POD.LineTotal,
    DD.DateFull AS PaymentDate, POD.ReceivedQty, POD.RejectedQty, POD.StockedQty,
    TRY_CONVERT(DATE, POD.ModifiedDate, 121) AS ModifiedDate
FROM Dmt.FactPurchaseOrderDetail POD
JOIN Dmt.DimDate DD ON CAST(CONVERT(VARCHAR, POD.DueDate) AS DATE) = DD.DateFull;
GO
 
CREATE VIEW Dmv.DimDate AS
SELECT DateKey, DateFull, Year, Quarter, Month, DayOfMonth, DayOfWeekName, DayOfWeek, MonthName, IsWeekend
FROM Dmt.DimDate
GO
```

### ETL SCRIPTS

```
USE BI23_Stage
GO
 
-- Extraction: bulk insert from source files into Sit
 
CREATE PROCEDURE Bulk_Into_Sit
AS
BEGIN
SET NOCOUNT ON;
 
BULK INSERT [Sit].[Product]
FROM 'C:\Product.txt'
WITH (FORMATFILE = 'C:\ProductFormat.txt', FIELDTERMINATOR = ';', ROWTERMINATOR = '\n', FIRSTROW = 2)
 
BULK INSERT [Sit].[Vendor]
FROM 'C:\Vendor.txt'
WITH (FORMATFILE = 'C:\VendorFormat.txt', FIELDTERMINATOR = ';', ROWTERMINATOR = '\n', FIRSTROW = 2)
 
BULK INSERT [Sit].[ShipMethod]
FROM 'C:\ShipMethod.txt'
WITH (FORMATFILE = 'C:\ShipMethodFormat.txt', FIELDTERMINATOR = ';', ROWTERMINATOR = '\n', FIRSTROW = 2)
 
BULK INSERT [Sit].[PurchaseOrderDetail]
FROM 'C:\PurchaseOrderDetail.txt'
WITH (FORMATFILE = 'C:\PurchaseOrderDetailFormat.txt', FIELDTERMINATOR = ';', ROWTERMINATOR = '\n', FIRSTROW = 2)
 
BULK INSERT [Sit].[PurchaseOrderHeader]
FROM 'C:\PurchaseOrderHeader.txt'
WITH (FORMATFILE = 'C:\PurchaseOrderHeaderFormat.txt', FIELDTERMINATOR = ';', ROWTERMINATOR = '\n', FIRSTROW = 2)
 
END;
GO
 
-- Merge: cleanse, type-cast, and upsert Sit -> Stt (one procedure per dimension/fact)
 
CREATE PROCEDURE Merge_Into_Stt
AS
BEGIN
SET NOCOUNT ON;
 
MERGE INTO [Stt].[Product] AS target
USING (
    SELECT 
		TRY_CAST([ProductID] AS INT) AS ProductID,
        LEFT([Name], 50) AS Name,
        LEFT([ProductNumber], 25) AS ProductNumber,
        TRY_CAST([MakeFlag] AS BIT) AS MakeFlag, 
        TRY_CAST([FinishedGoodsFlag] AS BIT) AS FinishedGoodsFlag,
        LEFT([Color], 15) AS Color,
        TRY_CAST([SafetyStockLevel] AS SMALLINT) AS SafetyStockLevel,
        TRY_CAST([ReorderPoint] AS SMALLINT) AS ReorderPoint,
        TRY_CAST(REPLACE([StandardCost], ',', '.') AS MONEY) AS StandardCost,
        TRY_CAST(REPLACE([ListPrice], ',', '.') AS MONEY) AS ListPrice,
        LEFT([Size], 5) AS Size,
        LEFT([SizeUnitMeasureCode], 3) AS SizeUnitMeasureCode,
        LEFT([WeightUnitMeasureCode], 3) AS WeightUnitMeasureCode,
        TRY_CAST([Weight] AS DECIMAL(8, 2)) AS Weight,
        TRY_CAST([DaysToManufacture] AS INT) AS DaysToManufacture,
        LEFT([ProductLine], 2) AS ProductLine,
        LEFT([Class], 2) AS Class,
        LEFT([Style], 2) AS Style,
        TRY_CAST([ProductSubcategoryID] AS INT) AS ProductSubcategoryID,
        TRY_CAST([ProductModelID] AS INT) AS ProductModelID,
        TRY_CONVERT(DATETIME, [SellStartDate], 121) AS SellStartDate,
        TRY_CONVERT(DATETIME, [SellEndDate], 121) AS SellEndDate,
        TRY_CONVERT(DATETIME, [DiscontinuedDate], 121) AS DiscontinuedDate,
        TRY_CAST([rowguid] AS UNIQUEIDENTIFIER) AS rowguid,
        TRY_CONVERT(DATETIME, [ModifiedDate], 121) AS ModifiedDate
    FROM [Sit].[Product]
) AS source
ON (target.ProductID = source.ProductID)
WHEN MATCHED THEN 
    UPDATE SET
        target.Name = source.Name, target.ProductNumber = source.ProductNumber, target.MakeFlag = source.MakeFlag,
        target.FinishedGoodsFlag = source.FinishedGoodsFlag, target.Color = source.Color,
        target.SafetyStockLevel = source.SafetyStockLevel, target.ReorderPoint = source.ReorderPoint,
        target.StandardCost = source.StandardCost, target.ListPrice = source.ListPrice, target.Size = source.Size,
        target.SizeUnitMeasureCode = source.SizeUnitMeasureCode, target.WeightUnitMeasureCode = source.WeightUnitMeasureCode,
        target.Weight = source.Weight, target.DaysToManufacture = source.DaysToManufacture,
        target.ProductLine = source.ProductLine, target.Class = source.Class, target.Style = source.Style,
        target.ProductSubcategoryID = source.ProductSubcategoryID, target.ProductModelID = source.ProductModelID,
        target.SellStartDate = source.SellStartDate, target.SellEndDate = source.SellEndDate,
        target.DiscontinuedDate = source.DiscontinuedDate, target.rowguid = source.rowguid,
        target.ModifiedDate = source.ModifiedDate
WHEN NOT MATCHED BY TARGET THEN 
    INSERT (
        ProductID, Name, ProductNumber, MakeFlag, FinishedGoodsFlag, Color, SafetyStockLevel, ReorderPoint,
        StandardCost, ListPrice, Size, SizeUnitMeasureCode, WeightUnitMeasureCode, Weight, DaysToManufacture, 
        ProductLine, Class, Style, ProductSubcategoryID, ProductModelID, SellStartDate, SellEndDate, 
        DiscontinuedDate, rowguid, ModifiedDate
    )
    VALUES (
        source.ProductID, source.Name, source.ProductNumber, source.MakeFlag, source.FinishedGoodsFlag, source.Color, 
        source.SafetyStockLevel, source.ReorderPoint, source.StandardCost, source.ListPrice, source.Size, 
        source.SizeUnitMeasureCode, source.WeightUnitMeasureCode, source.Weight, source.DaysToManufacture, 
        source.ProductLine, source.Class, source.Style, source.ProductSubcategoryID, source.ProductModelID, 
        source.SellStartDate, source.SellEndDate, source.DiscontinuedDate, source.rowguid, source.ModifiedDate
    );
 
UPDATE [Stt].[Product]
SET
    SizeUnitMeasureCode = CASE WHEN SizeUnitMeasureCode = 'NUL' THEN 'NA' ELSE SizeUnitMeasureCode END,
    Size = CASE WHEN Size = 'NULL' THEN 'NA' ELSE Size END,
    Color = CASE WHEN Color = 'NULL' THEN 'NA' ELSE Color END,
    Name = CASE WHEN Name = 'NULL' THEN 'NA' ELSE Name END,
    Class = CASE WHEN Class = 'NU' THEN 'NA' ELSE Class END,
    Style = CASE WHEN Style = 'NU' THEN 'NA' ELSE Style END,
    WeightUnitMeasureCode = CASE WHEN WeightUnitMeasureCode = 'NUL' THEN 'NA' ELSE WeightUnitMeasureCode END,
    ProductLine = CASE WHEN ProductLine = 'NU' THEN 'NA' ELSE ProductLine END,
    ProductNumber = CASE WHEN ProductNumber = 'NULL' THEN 'NA' ELSE ProductNumber END,
    ProductID = ISNULL(ProductID, -1), MakeFlag = ISNULL(MakeFlag, 0), FinishedGoodsFlag = ISNULL(FinishedGoodsFlag, 0),
    SafetyStockLevel = ISNULL(SafetyStockLevel, -1), ReorderPoint = ISNULL(ReorderPoint, -1),
    StandardCost = ISNULL(StandardCost, 0), ListPrice = ISNULL(ListPrice, -1.00), Weight = ISNULL(Weight, -1.00),
    DaysToManufacture = ISNULL(DaysToManufacture, -1), ProductSubcategoryID = ISNULL(ProductSubcategoryID, -1),
    ProductModelID = ISNULL(ProductModelID, -1), SellStartDate = ISNULL(SellStartDate, '2000-01-01'),
    SellEndDate = ISNULL(SellEndDate, '2000-01-01'), DiscontinuedDate = ISNULL(DiscontinuedDate, '2000-01-01'),
    ModifiedDate = ISNULL(ModifiedDate, '2000-01-01'),
    rowguid = ISNULL(rowguid, '00000000-0000-0000-0000-000000000000');
 
MERGE INTO [BI23_STAGE].[Stt].[Vendor] AS target
USING (
    SELECT 
        TRY_CAST(BusinessEntityID AS INT) AS VendorID, [AccountNumber], [Name],
        TRY_CAST([CreditRating] AS TINYINT) AS CreditRating,
        TRY_CAST([PreferredVendorStatus] AS BIT) AS PreferredVendorStatus,
        TRY_CAST([ActiveFlag] AS BIT) AS ActiveFlag, [PurchasingWebServiceURL],
        TRY_CONVERT(DATETIME, [ModifiedDate], 121) AS ModifiedDate 
    FROM [BI23_STAGE].[Sit].[Vendor] 
) AS source
ON (target.VendorID = source.VendorID)
WHEN MATCHED THEN
    UPDATE SET
        target.AccountNumber = source.AccountNumber, target.Name = source.Name, target.CreditRating = source.CreditRating,
        target.PreferredVendorStatus = source.PreferredVendorStatus, target.ActiveFlag = source.ActiveFlag,
        target.PurchasingWebServiceURL = source.PurchasingWebServiceURL, target.ModifiedDate = source.ModifiedDate
WHEN NOT MATCHED BY TARGET THEN
    INSERT (VendorID, AccountNumber, Name, CreditRating, PreferredVendorStatus, ActiveFlag, PurchasingWebServiceURL, ModifiedDate)
    VALUES (source.VendorID, source.AccountNumber, source.Name, source.CreditRating, source.PreferredVendorStatus, 
	source.ActiveFlag, source.PurchasingWebServiceURL, source.ModifiedDate);
 
UPDATE [Stt].[Vendor]
SET
    AccountNumber = CASE WHEN AccountNumber = 'NULL' THEN 'NA' ELSE AccountNumber END,
    Name = CASE WHEN Name = 'NULL' THEN 'NA' ELSE Name END,
	PurchasingWebServiceURL = CASE WHEN PurchasingWebServiceURL = 'NULL' THEN 'NA' ELSE PurchasingWebServiceURL END,
    CreditRating = ISNULL(CreditRating, 0), PreferredVendorStatus = ISNULL(PreferredVendorStatus, 0),
    ActiveFlag = ISNULL(ActiveFlag, 0), ModifiedDate = ISNULL(ModifiedDate, '2000-01-01');
 
MERGE INTO [BI23_Stage].[Stt].[ShipMethod] AS target
USING (
    SELECT 
        TRY_CAST([ShipMethodID] AS INT) AS ShipMethodID, [Name] AS Name, 
        TRY_CAST(REPLACE([ShipBase], ',', '.') AS MONEY) AS ShipBase,
        TRY_CAST(REPLACE([ShipRate], ',', '.') AS MONEY) AS ShipRate,
        TRY_CAST([rowguid] AS UNIQUEIDENTIFIER) AS rowguid,
        TRY_CONVERT(DATETIME, [ModifiedDate], 121) AS ModifiedDate
    FROM [Sit].[ShipMethod]
) AS source
ON (target.ShipMethodID = source.ShipMethodID)
WHEN MATCHED THEN
    UPDATE SET
        target.Name = source.Name, target.ShipBase = source.ShipBase, target.ShipRate = source.ShipRate,
        target.rowguid = source.rowguid, target.ModifiedDate = source.ModifiedDate
WHEN NOT MATCHED BY TARGET THEN
    INSERT (ShipMethodID, Name, ShipBase, ShipRate, rowguid, ModifiedDate)
    VALUES (source.ShipMethodID, source.Name, source.ShipBase, source.ShipRate, source.rowguid, source.ModifiedDate);
 
UPDATE [Stt].[ShipMethod]
SET
    Name = CASE WHEN Name ='NULL' THEN 'NA' ELSE Name END,
    ShipBase = ISNULL(ShipBase, 0), ShipRate = ISNULL(ShipRate, 0), ModifiedDate = ISNULL(ModifiedDate, '2000-01-01');
 
MERGE INTO [BI23_Stage].[Stt].[PurchaseOrderHeader] AS target
USING (
    SELECT 
        TRY_CAST([PurchaseOrderID] AS INT) AS PurchaseOrderID, TRY_CAST([RevisionNumber] AS TINYINT) AS RevisionNumber,
        TRY_CAST([Status] AS TINYINT) AS Status, TRY_CAST([EmployeeID] AS INT) AS EmployeeID,
        TRY_CAST([VendorID] AS INT) AS VendorID, TRY_CAST([ShipMethodID] AS INT) AS ShipMethodID,
        TRY_CONVERT(DATETIME, [OrderDate], 121) AS OrderDate, TRY_CONVERT(DATETIME, [ShipDate], 121) AS ShipDate,
        TRY_CAST(REPLACE([SubTotal], ',', '.') AS MONEY) AS SubTotal, TRY_CAST(REPLACE([TaxAmt], ',', '.') AS MONEY) AS TaxAmt,
        TRY_CAST(REPLACE([Freight], ',', '.') AS MONEY) AS Freight,
        TRY_CONVERT(DATETIME, [ModifiedDate], 121) AS ModifiedDate
    FROM [Sit].[PurchaseOrderHeader]
) AS source
ON (target.PurchaseOrderID = source.PurchaseOrderID)
WHEN MATCHED THEN
    UPDATE SET
        target.RevisionNumber = source.RevisionNumber, target.Status = source.Status, target.EmployeeID = source.EmployeeID,
        target.VendorID = source.VendorID, target.ShipMethodID = source.ShipMethodID, target.OrderDate = source.OrderDate,
        target.ShipDate = source.ShipDate, target.SubTotal = source.SubTotal, target.TaxAmt = source.TaxAmt,
        target.Freight = source.Freight, target.ModifiedDate = source.ModifiedDate
WHEN NOT MATCHED BY TARGET THEN
    INSERT (PurchaseOrderID, RevisionNumber, Status, EmployeeID, VendorID, ShipMethodID, OrderDate, ShipDate, SubTotal, TaxAmt, Freight, ModifiedDate)
    VALUES (source.PurchaseOrderID, source.RevisionNumber, source.Status, source.EmployeeID, source.VendorID, source.ShipMethodID, 
	source.OrderDate, source.ShipDate, source.SubTotal, source.TaxAmt, source.Freight, source.ModifiedDate);
 
UPDATE [BI23_Stage].[Stt].[PurchaseOrderHeader]
SET
    RevisionNumber = ISNULL(RevisionNumber, -1), Status = ISNULL(Status, 0), EmployeeID = ISNULL(EmployeeID, -1),
    VendorID = ISNULL(VendorID, -1), ShipMethodID = ISNULL(ShipMethodID, -1), OrderDate = ISNULL(OrderDate, '2000-01-01'),
    ShipDate = ISNULL(ShipDate, '2000-01-01'), SubTotal = ISNULL(SubTotal, -1.00), TaxAmt = ISNULL(TaxAmt, -1.00),
    Freight = ISNULL(Freight, -1.00), ModifiedDate = ISNULL(ModifiedDate, '2000-01-01');
 
MERGE INTO [BI23_Stage].[Stt].[PurchaseOrderDetail] AS target
USING (
    SELECT 
        TRY_CAST([PurchaseOrderID] AS INT) AS PurchaseOrderID, TRY_CAST([PurchaseOrderDetailID] AS INT) AS PurchaseOrderDetailID,
        CAST(REPLACE(CONVERT(VARCHAR(10), [DueDate], 112), '-', '') AS INT) AS DueDate,
        TRY_CAST([OrderQty] AS SMALLINT) AS OrderQty, TRY_CAST([ProductID] AS INT) AS ProductID,
        TRY_CAST(REPLACE([UnitPrice], ',', '.') AS MONEY) AS UnitPrice,
        TRY_CAST([ReceivedQty] AS DECIMAL(8, 2)) AS ReceivedQty, TRY_CAST([RejectedQty] AS DECIMAL(8, 2)) AS RejectedQty,
        TRY_CONVERT(DATETIME, [ModifiedDate], 121) AS ModifiedDate
    FROM [Sit].[PurchaseOrderDetail]
) AS source
ON (target.PurchaseOrderID = source.PurchaseOrderID AND target.PurchaseOrderDetailID = source.PurchaseOrderDetailID)
WHEN MATCHED THEN 
    UPDATE SET
        target.DueDate = source.DueDate, target.OrderQty = source.OrderQty, target.ProductID = source.ProductID,
        target.UnitPrice = source.UnitPrice, target.ReceivedQty = source.ReceivedQty, target.RejectedQty = source.RejectedQty,
        target.ModifiedDate = source.ModifiedDate
WHEN NOT MATCHED BY TARGET THEN 
    INSERT (PurchaseOrderID, PurchaseOrderDetailID, DueDate, OrderQty, ProductID, UnitPrice, ReceivedQty, RejectedQty, ModifiedDate)
    VALUES (source.PurchaseOrderID, source.PurchaseOrderDetailID, source.DueDate, source.OrderQty, source.ProductID, 
	source.UnitPrice, source.ReceivedQty, source.RejectedQty, source.ModifiedDate);
 
UPDATE [BI23_Stage].[Stt].[PurchaseOrderDetail]
SET
    PurchaseOrderID = ISNULL(PurchaseOrderID, -1), PurchaseOrderDetailID = ISNULL(PurchaseOrderDetailID, -1),
    OrderQty = ISNULL(OrderQty, -1), ProductID = ISNULL(ProductID, -1), UnitPrice = ISNULL(UnitPrice, -1.00),
    DueDate = ISNULL(DueDate, 20000101), ReceivedQty = ISNULL(ReceivedQty, -1.00), RejectedQty = ISNULL(RejectedQty, -1.00),
    ModifiedDate = ISNULL(ModifiedDate, '2000-01-01');
 
UPDATE pod
SET pod.VendorID = poh.VendorID, pod.ShipMethodID = poh.ShipMethodID
FROM [BI23_Stage].[Stt].[PurchaseOrderDetail] pod
INNER JOIN [BI23_Stage].[Stt].[PurchaseOrderHeader] poh ON pod.PurchaseOrderID = poh.PurchaseOrderID;
 
END;
GO
 
-- Fact load with surrogate key propagation: Stt -> Dmt/Dmv
 
CREATE PROCEDURE Insert_Into_DM
AS
BEGIN
SET NOCOUNT ON;
 
INSERT INTO [BI23_DM].[Dmt].[DimProduct](
	[ProductSK], [ProductID], [Name], [ProductNumber], [MakeFlag], [FinishedGoodsFlag], [Color],
    [SafetyStockLevel], [ReorderPoint], [StandardCost], [ListPrice], [Size], [SizeUnitMeasureCode],
    [WeightUnitMeasureCode], [Weight], [DaysToManufacture], [ProductLine], [Class], [Style],
    [ProductSubcategoryID], [ProductModelID], [SellStartDate], [SellEndDate], [DiscontinuedDate], [rowguid], [ModifiedDate]
)
SELECT 
	[ProductSK], [ProductID], [Name], [ProductNumber], [MakeFlag], [FinishedGoodsFlag], [Color],
    [SafetyStockLevel], [ReorderPoint], [StandardCost], [ListPrice], [Size], [SizeUnitMeasureCode],
    [WeightUnitMeasureCode], [Weight], [DaysToManufacture], [ProductLine], [Class], [Style],
    [ProductSubcategoryID], [ProductModelID], [SellStartDate], [SellEndDate], [DiscontinuedDate], [rowguid], [ModifiedDate]
FROM [BI23_Stage].[Stt].[Product];
 
INSERT INTO [BI23_DM].[Dmt].[DimVendor](
	[VendorSK], [VendorID], [AccountNumber], [Name], [CreditRating], [PreferredVendorStatus],
	[ActiveFlag], [PurchasingWebServiceURL], [ModifiedDate]
)
SELECT
	[VendorSK], [VendorID], [AccountNumber], [Name], [CreditRating], [PreferredVendorStatus],
	[ActiveFlag], [PurchasingWebServiceURL], [ModifiedDate]
FROM [BI23_Stage].[Stt].[Vendor];
 
INSERT INTO [BI23_DM].[Dmt].[DimShipMethod](   
	[ShipMethodSK], [ShipMethodID], [Name], [ShipBase], [ShipRate], [rowguid], [ModifiedDate]
)
SELECT
	[ShipMethodSK], [ShipMethodID], [Name], [ShipBase], [ShipRate], [rowguid], [ModifiedDate]
FROM [BI23_Stage].[Stt].[ShipMethod];
 
INSERT INTO [BI23_DM].[Dmt].[DimPurchaseOrderHeader](
	[PurchaseOrderHeaderSK], [PurchaseOrderID], [RevisionNumber], [Status], [EmployeeID], [VendorID],
	[ShipMethodID], [OrderDate], [ShipDate], [SubTotal], [TaxAmt], [Freight], [ModifiedDate]
)
SELECT
	[PurchaseOrderHeaderSK], [PurchaseOrderID], [RevisionNumber], [Status], [EmployeeID], [VendorID],
	[ShipMethodID], [OrderDate], [ShipDate], [SubTotal], [TaxAmt], [Freight], [ModifiedDate]
FROM [BI23_Stage].[Stt].[PurchaseOrderHeader];
 
INSERT INTO [BI23_DM].[Dmt].[FactPurchaseOrderDetail](
	[PurchaseOrderDetailSK], [PurchaseOrderID], [PurchaseOrderDetailID], [DueDate], [OrderQty], [ProductID], 
    [UnitPrice], [LineTotal], [ReceivedQty], [RejectedQty], [StockedQty], [ModifiedDate], [VendorID], [ShipMethodID]
)
SELECT 
	[PurchaseOrderDetailSK], [PurchaseOrderID], [PurchaseOrderDetailID], [DueDate], [OrderQty], [ProductID], 
    [UnitPrice], [LineTotal], [ReceivedQty], [RejectedQty], [StockedQty], [ModifiedDate], [VendorID], [ShipMethodID]
FROM [BI23_Stage].[Stt].[PurchaseOrderDetail];
 
END;
GO
 
-- Foreign key management (dropped before fact reload, re-added after, to avoid constraint violations mid-load)
 
CREATE PROCEDURE ADD_FK
AS BEGIN
SET NOCOUNT ON;
ALTER TABLE Dmt.FactPurchaseOrderDetail ADD CONSTRAINT FK_PurchaseOrderID FOREIGN KEY (PurchaseOrderID) REFERENCES Dmt.DimPurchaseOrderHeader (PurchaseOrderID);
ALTER TABLE Dmt.FactPurchaseOrderDetail ADD CONSTRAINT FK_ProductID FOREIGN KEY (ProductID) REFERENCES Dmt.DimProduct (ProductID);
ALTER TABLE Dmt.FactPurchaseOrderDetail ADD CONSTRAINT FK_VendorID FOREIGN KEY (VendorID) REFERENCES Dmt.DimVendor (VendorID);
ALTER TABLE Dmt.FactPurchaseOrderDetail ADD CONSTRAINT FK_ShipMethodID FOREIGN KEY (ShipMethodID) REFERENCES Dmt.DimShipMethod (ShipMethodID);
ALTER TABLE Dmt.FactPurchaseOrderDetail ADD CONSTRAINT FK_DimDate FOREIGN KEY (DueDate) REFERENCES Dmt.DimDate (DateKey);
END;
GO
 
CREATE PROCEDURE DROP_FK
AS BEGIN
SET NOCOUNT ON;
ALTER TABLE Dmt.FactPurchaseOrderDetail DROP CONSTRAINT FK_PurchaseOrderID;
ALTER TABLE Dmt.FactPurchaseOrderDetail DROP CONSTRAINT FK_ProductID;
ALTER TABLE Dmt.FactPurchaseOrderDetail DROP CONSTRAINT FK_VendorID;
ALTER TABLE Dmt.FactPurchaseOrderDetail DROP CONSTRAINT FK_ShipMethodID;
ALTER TABLE Dmt.FactPurchaseOrderDetail DROP CONSTRAINT FK_DimDate;
END;
GO
```

### Pipeline Execution


```
USE [msdb]
GO
 
BEGIN TRANSACTION
DECLARE @ReturnCode INT
SELECT @ReturnCode = 0
 
IF NOT EXISTS (SELECT name FROM msdb.dbo.syscategories WHERE name=N'[Uncategorized (Local)]' AND category_class=1)
BEGIN
EXEC @ReturnCode = msdb.dbo.sp_add_category @class=N'JOB', @type=N'LOCAL', @name=N'[Uncategorized (Local)]'
IF (@@ERROR <> 0 OR @ReturnCode <> 0) GOTO QuitWithRollback
END
 
DECLARE @jobId BINARY(16)
EXEC @ReturnCode =  msdb.dbo.sp_add_job @job_name=N'PipelineAssaignment', 
		@enabled=1, 
		@notify_level_eventlog=0, 
		@notify_level_email=0, 
		@notify_level_netsend=0, 
		@notify_level_page=0, 
		@delete_level=0, 
		@description=N'No description available.', 
		@category_name=N'[Uncategorized (Local)]', 
		@owner_login_name=N'ZinoAsus\zinom', @job_id = @jobId OUTPUT
IF (@@ERROR <> 0 OR @ReturnCode <> 0) GOTO QuitWithRollback
 
EXEC @ReturnCode = msdb.dbo.sp_add_jobstep @job_id=@jobId, @step_name=N'AssignmentAutomatization', 
		@step_id=1, 
		@cmdexec_success_code=0, 
		@on_success_action=1, 
		@on_success_step_id=0, 
		@on_fail_action=2, 
		@on_fail_step_id=0, 
		@retry_attempts=0, 
		@retry_interval=0, 
		@os_run_priority=0, @subsystem=N'TSQL', 
		@command=N'USE BI23_Stage
GO
 
-- 1. Truncate raw landing tables
TRUNCATE TABLE BI23_Stage.Sit.Product;
TRUNCATE TABLE BI23_Stage.Sit.ShipMethod;
TRUNCATE TABLE BI23_Stage.Sit.Vendor;
TRUNCATE TABLE BI23_Stage.Sit.PurchaseOrderDetail;
TRUNCATE TABLE BI23_Stage.Sit.PurchaseOrderHeader;
 
-- 2. Bulk insert new source extract into Sit
EXEC Bulk_Into_Sit
 
-- 3. Cleanse, type, and upsert Sit -> Stt
EXEC Merge_Into_Stt
GO
 
USE BI23_DM
GO
 
-- 4. Drop FKs before full fact reload
EXEC DROP_FK
GO
 
-- 5. Truncate data mart for full reload
TRUNCATE TABLE BI23_DM.Dmt.FactPurchaseOrderDetail;
TRUNCATE TABLE BI23_DM.Dmt.DimPurchaseOrderHeader;
TRUNCATE TABLE BI23_DM.Dmt.DimProduct;
TRUNCATE TABLE BI23_DM.Dmt.DimShipMethod;
TRUNCATE TABLE BI23_DM.Dmt.DimVendor;
GO
 
-- 6. Reload data mart from Stt
EXEC Insert_Into_DM
GO
 
-- 7. Re-add FKs
EXEC ADD_FK
GO
 
', 
		@database_name=N'master', 
		@flags=0
IF (@@ERROR <> 0 OR @ReturnCode <> 0) GOTO QuitWithRollback
EXEC @ReturnCode = msdb.dbo.sp_update_job @job_id = @jobId, @start_step_id = 1
IF (@@ERROR <> 0 OR @ReturnCode <> 0) GOTO QuitWithRollback
EXEC @ReturnCode = msdb.dbo.sp_add_jobserver @job_id = @jobId, @server_name = N'(local)'
IF (@@ERROR <> 0 OR @ReturnCode <> 0) GOTO QuitWithRollback
COMMIT TRANSACTION
GOTO EndSave
QuitWithRollback:
    IF (@@TRANCOUNT > 0) ROLLBACK TRANSACTION
EndSave:
GO
```
