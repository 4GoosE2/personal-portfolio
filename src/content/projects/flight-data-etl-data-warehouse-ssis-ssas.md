---
title: Flight Data ETL & Data Warehouse (SSIS + SSAS)
category: Data Analytics & BI
subcategory: Data Warehousing & ETL Pipeline Design
track: Educational Projects
source: Nackademin
context: Data Capture, Migration and Transformation
tags:
  - SSIS
  - SSAS
  - ETL
  - Star Schema
  - Data Warehousing
  - Tabular Model
  - DAX
date: 28 June 2024
note: >-
  Built for my Streaming Data and Cloud Solutions course at Nackademin: a full
  ETL-to-semantic-layer pipeline for airline flight data. SSIS handles
  extraction and load, a star schema (DimAirplane, DimCarriers, DimDate,
  DimRoutes, FactFlight) structures the warehouse, and an SSAS Tabular model on
  top provides DAX measures for analysis.


  The build includes proper referential integrity handling: rather than letting broken foreign keys through, unmatched or missing tail numbers are routed to a placeholder "John Doe" dimension record, a standard data warehousing technique for preserving relationships when source data is incomplete. Getting there involved a real data quality investigation, tracing exactly how many records failed to match reference data across the source system, staging area, and final cleaned table, separating genuine data issues from already-cancelled flights that didn't need remediation.


  The semantic layer sits on top in SSAS Tabular, with working DAX measures (AvgArrDelay, MaxArrDelay) and defined relationships across all four dimension tables.
metrics:
  - label: Warehouse structure
    value: 4 dimension tables + 1 fact table (DimAirplane, DimCarriers, DimDate,
      DimRoutes, FactFlight)
  - value: 4 SSIS packages (main load, bulk insert, data profiling, test)
    label: ETL layer
  - value: SSAS Tabular model with 2+ DAX measures (AvgArrDelay, MaxArrDelay)
    label: Semantic Layer
images:
  - /uploads/screenshot-2024-05-28-190031.png
  - /uploads/screenshot-2024-05-28-185944.png
  - /uploads/null-hantering.png
---
### Data Warehouse Schema & Constraints

```
ALTER TABLE DimAirplane
ALTER COLUMN TailNumber VARCHAR(15) NOT NULL;
ALTER TABLE DimCarriers
ALTER COLUMN CarriersID VARCHAR(50) NOT NULL;
ALTER TABLE DimDate
ALTER COLUMN DateKey INT NOT NULL;
ALTER TABLE DimRoutes
ALTER COLUMN RoutesID INT NOT NULL;
ALTER TABLE FactFlight
ALTER COLUMN FlightID INT NOT NULL;
ALTER TABLE DimAirplane
ADD CONSTRAINT PK_airplane PRIMARY KEY (TailNumber);
ALTER TABLE DimCarriers
ADD CONSTRAINT PK_Carriers PRIMARY KEY (CarriersID);
ALTER TABLE DimDate
ADD CONSTRAINT PK_Date PRIMARY KEY (DateKey);
ALTER TABLE DimRoutes
ADD CONSTRAINT PK_Routes PRIMARY KEY (RoutesID);
ALTER TABLE FactFlight
ADD CONSTRAINT PK_Flight PRIMARY KEY (FlightID);
ALTER TABLE FactFlight
ADD CONSTRAINT FK_RoutesID
FOREIGN KEY (RoutesID) REFERENCES DimRoutes(RoutesID);
ALTER TABLE FactFlight
ADD CONSTRAINT FK_FlightDate
FOREIGN KEY (FlightDate) REFERENCES DimDate(DateKey);
ALTER TABLE FactFlight
ADD CONSTRAINT FK_TailNumber
FOREIGN KEY (TailNumber) REFERENCES DimAirplane(TailNumber);
ALTER TABLE FactFlight
ADD CONSTRAINT FK_CarrierID
FOREIGN KEY (CarrierID) REFERENCES DimCarriers(CarriersID);
SELECT DISTINCT RoutesID
FROM FactFlight
WHERE RoutesID NOT IN (SELECT RoutesID FROM DimRoutes);
DELETE FROM FactFlight
WHERE FlightID = -1
SELECT * 
FROM FactFlight
WHERE FlightID = -1
-- Find rows in FactFlight that do not have a corresponding entry in DimAirplane
SELECT ff.*
FROM FactFlight ff
LEFT JOIN DimAirplane da ON ff.TailNumber = da.TailNumber
WHERE da.TailNumber IS NULL;
SELECT * 
FROM DimAirplane
WHERE TailNumber = 'N10156'
SELECT * 
FROM FactFlight
WHERE Tailnumber = 'N10165'
INSERT INTO DimAirplane (TailNumber, other_columns)
SELECT DISTINCT ff.TailNumber, 'default_values_for_other_columns'
FROM FactFlight ff
LEFT JOIN DimAirplane da ON ff.TailNumber = da.TailNumber
WHERE da.TailNumber IS NULL;
SELECT DISTINCT TailNumber FROM FactFlight WHERE TailNumber IS NOT NULL;
SELECT DISTINCT TailNumber FROM DimAirplane WHERE TailNumber IS NOT NULL;
SELECT ff.TailNumber, da.TailNumber
FROM FactFlight ff
LEFT JOIN DimAirplane da ON ff.TailNumber = da.TailNumber
WHERE da.TailNumber is null
SELECT DISTINCT Tailnumber
FROM FactFlight
WHERE Tailnumber NOT IN (SELECT TailNumber FROM DimAirplane);
SELECT * 
FROM DimAirplane
WHERE Tailnumber = 'John Doe'

```

### Unknown-Member Handling

```
INSERT INTO DimAirplane 
VALUES('John Doe', 'NA', 'NA', 'NA', 'NA', 'NA', 'NA', 'NA', 'NA')
GO

INSERT INTO DimCarriers
VALUES('N', 'N')
GO



INSERT INTO DimDate
VALUES(-1, '0001-01-01', -1, 'NA', -1, 'NA', 0, 0, 'NA', -1, -1, -1, -1, 'NA', -1, -1, 'NA', 'NA')
GO


INSERT INTO DimRoutes
VALUES(-1, 'NA', -1, 'NA', 'NA', 'NA', 'NA', 'NA', 'NA', 'NA', 'NA', 'NA', 'NA', 'NA', 'NA', 'NA')
GO


SET IDENTITY_INSERT FactFlight ON;
GO


INSERT INTO FactFlight (
    FlightID, RoutesID, FlightDate, DepTime, CRSDepTime, ArrTime, CRSArrTime, 
    Tailnumber, FlightNum, CarrierID, AirTime, ArrDelay, DepDelay, ActualElapsedTime, 
    CRSElapsedTime, TaxiIn, TaxiOut, Cancelled, CancellationCode, Diverted, 
    CarrierDelay, WeatherDelay, NASDelay, SecurityDelay, LateAircraftDelay, 
    Year, Month, DayofMonth, DayOfWeek, Origin, Dest, Distance
) VALUES (
    -1, -1, -1, '00:00:00', '00:00:00', '00:00:00', '00:00:00', 
    'John Doe', -1, 'NA', -1, 0, 0, -1, 
    -1, -1, -1, -1, 'NA', 'NA', 
    'NA', 'NA', 'NA', 'NA', 'NA', 
    -1, 0, 0, 0, 'NA', 'NA', -1
);
GO
SET IDENTITY_INSERT FactFlight OFF

SELECT*
FROM FactFlight
WHERE FlightID = -1


	DELETE FROM DimAirplane
	WHERE TailNumber = 'JohnDoe'

Select * 
FROM DimAirplane
WHERE TailNumber = 'JohnDoe'

UPDATE FactFlight
SET TailNumber = 'John Doe'
WHERE TailNumber = 'JohnDoe'

ALTER TABLE FactFlight
ADD FlightID INT PRIMARY KEY IDENTITY (1,1)
```

### Data Quality Investigation

```
SELECT *
FROM PlaneData
WHERE tailnum = 'N224NW'


Year	Month	DayofMonth	DayOfWeek	DepTime	CRSDepTime	ArrTime	CRSArrTime	UniqueCarrier	FlightNum	TailNum	ActualElapsedTime	CRSElapsedTime	AirTime	ArrDelay	DepDelay	Origin	Dest	Distance	TaxiIn	TaxiOut	Cancelled	CancellationCode	Diverted	CarrierDelay	WeatherDelay	NASDelay	SecurityDelay	LateAircraftDelay	plane_tailnum
2005	3	16	3	1231	1235	1342	1339	MQ	4740	N705AE	71	64	43	3	-4	DCA	JFK	213	10	18	0	N	0	0	0	0	0	0	N705AE
Year	Month	DayofMonth	DayOfWeek	DepTime	CRSDepTime	ArrTime	CRSArrTime	UniqueCarrier	FlightNum	TailNum	ActualElapsedTime	CRSElapsedTime	AirTime	ArrDelay	DepDelay	Origin	Dest	Distance	TaxiIn	TaxiOut	Cancelled	CancellationCode	Diverted	CarrierDelay	WeatherDelay	NASDelay	SecurityDelay	LateAircraftDelay
2005	3	10	4	1830	1830	606	604	NW	98	N224NW	456	454	434	2	0	HNL	MSP	3972	4	18	0	N	0	0	0	0	0	0

SELECT o.*
FROM StagingArea.dbo.goodFlightsData o
LEFT JOIN PlaneData p ON o.TailNum = p.TailNum
WHERE o.TailNum = 'John Doe'
  AND p.TailNum IS NULL;

SELECT 
    COUNT(*) AS Total_TailNum_Not_Matching,
    SUM(CASE WHEN o.tailnum = 'John Doe' THEN 1 ELSE 0 END) AS John_Doe_Count
FROM StagingArea.dbo.goodFlightsData o
LEFT JOIN planedata p ON o.tailnum = p.tailnum
WHERE p.tailnum IS NULL;

SELECT 
    COUNT(*) AS Total_TailNum_Not_Matching,
    SUM(CASE WHEN o.tailnum = 'John Doe' THEN 1 ELSE 0 END) AS John_Doe_Count,
    SUM(CASE WHEN o.tailnum IS NULL THEN 1 ELSE 0 END) AS Null_TailNum_Count,
    SUM(CASE WHEN o.Cancelled = 1 THEN 1 ELSE 0 END) AS Cancelled_Count
FROM StagingArea.dbo.goodFlightsData o
LEFT JOIN planedata p ON o.tailnum = p.tailnum
WHERE p.tailnum IS NULL;


SELECT 
    COUNT(*) AS Total_TailNum_Not_Matching_Not_Cancelled,
    SUM(CASE WHEN o.tailnum = 'John Doe' THEN 1 ELSE 0 END) AS John_Doe_Count
FROM StagingArea.dbo.goodFlightsData o
LEFT JOIN planedata p ON o.tailnum = p.tailnum
WHERE p.tailnum IS NULL AND o.Cancelled = 0;


SELECT 
    COUNT(*) AS Total_TailNum_Not_Matching_Or_Null_Not_Cancelled,
    SUM(CASE WHEN o.tailnum = 'John Doe' THEN 1 ELSE 0 END) AS John_Doe_Count
FROM StagingArea.dbo.goodFlightsData o
LEFT JOIN planedata p ON o.tailnum = p.tailnum
WHERE (p.tailnum IS NULL OR o.tailnum IS NULL) AND o.Cancelled = 0;



SELECT 
    COUNT(*) AS Not_Matching
FROM SourceSysyems.dbo.FlightData f
LEFT JOIN planedata p ON f.tailnum = p.tailnum
WHERE (p.tailnum IS NULL OR f.tailnum IS NULL) AND f.cancelled = 0;

SELECT 
    COUNT(*) AS John_Doe_Count
FROM StagingArea.dbo.goodFlightsData
WHERE tailnum = 'John Doe';



-- First, ensure you are using the correct database context for SourceSysyems
USE SourceSysyems;

-- Count tailnum values that do not match planedata and are not cancelled
SELECT 
    (SELECT COUNT(*) 
     FROM SourceSysyems.dbo.FlightData sf
     LEFT JOIN SourceSysyems.dbo.PlaneData sp ON sf.tailnum = sp.tailnum
     WHERE (sp.tailnum IS NULL OR sf.tailnum IS NULL) 
       AND sf.cancelled = 0) AS Total_TailNum_Not_Matching_Or_Null_Not_Cancelled,
     
    -- Count 'John Doe' in the StagingArea
    (SELECT COUNT(*) 
     FROM StagingArea.dbo.goodFlightsData sa
     WHERE sa.tailnum = 'John Doe') AS John_Doe_Count;




SELECT f.*
FROM flightData f
LEFT JOIN planedata p ON f.tailnum = p.tailnum
WHERE (p.tailnum IS NULL OR f.tailnum IS NULL) AND f.cancelled = 0;


USE StagingArea;

SELECT f.*
FROM goodFlightsData f
WHERE (f.tailnum IS NULL OR f.tailnum != 'John Doe') 
AND EXISTS (
    SELECT 1
    FROM SourceSysyems.dbo.flightdata sf
    LEFT JOIN SourceSysyems.dbo.planedata sp ON sf.tailnum = sp.tailnum
    WHERE (sp.tailnum IS NULL OR sf.tailnum IS NULL) 
    AND sf.cancelled = 0 
    AND sf.tailnum = f.tailnum
);


-- Ensure you are using the correct database context for StagingArea
USE StagingArea;

-- Select tailnum values from StagingArea.flights with Cancelled = 0
-- that do not match any tailnum in SourceSysyems.planedata
SELECT sa.tailnum
FROM StagingArea.dbo.goodFlightsData sa
LEFT JOIN SourceSysyems.dbo.planedata sp ON sa.tailnum = sp.tailnum
WHERE sa.cancelled = 0
  AND sp.tailnum IS NULL;


-- Ensure you are using the correct database context for StagingArea
USE StagingArea;

-- Select tailnum values from StagingArea.flights with Cancelled = 0
-- that do not match any tailnum in SourceSysyems.planedata
SELECT sa.tailnum
FROM StagingArea.dbo.goodFlightsData sa
LEFT JOIN SourceSysyems.dbo.Planedata sp ON sa.tailnum = sp.tailnum
WHERE sa.cancelled = 0
  AND sp.tailnum IS NULL;


USE StagingArea;

SELECT unmatched.tailnum, sa.tailnum AS staging_tailnum
FROM StagingArea.dbo.goodFlightsData sa
LEFT JOIN (
    SELECT sf.tailnum
    FROM SourceSysyems.dbo.FlightData sf
    LEFT JOIN SourceSysyems.dbo.PlaneData sp ON sf.tailnum = sp.tailnum
    WHERE (sp.tailnum IS NULL OR sf.tailnum IS NULL) 
      AND sf.cancelled = 0
) AS unmatched ON sa.tailnum = unmatched.tailnum
WHERE unmatched.tailnum IS NOT NULL
  AND sa.tailnum != 'John Doe';


USE StagingArea;

-- Identify all tailnum values that are not 'John Doe'
SELECT sa.tailnum
FROM StagingArea.dbo.goodFlightsData sa
LEFT JOIN (
    SELECT sf.tailnum
    FROM SourceSysyems.dbo.FlightData sf
    LEFT JOIN SourceSysyems.dbo.PlaneData sp ON sf.tailnum = sp.tailnum
    WHERE (sp.tailnum IS NULL OR sf.tailnum IS NULL) 
      AND sf.cancelled = 0
) AS unmatched ON sa.tailnum = unmatched.tailnum
WHERE unmatched.tailnum IS NOT NULL
  AND sa.tailnum != 'John Doe';



USE SourceSysyems;

SELECT sf.tailnum
FROM SourceSysyems.dbo.FlightData sf
LEFT JOIN SourceSysyems.dbo.PlaneData sp ON sf.tailnum = sp.tailnum
WHERE (sp.tailnum IS NULL OR sf.tailnum IS NULL) 
  AND sf.cancelled = 0;


-- Ensure you are using the correct database context for StagingArea
USE StagingArea;

-- Select tailnum values from goodFlightsData that do not exist in PlaneData
SELECT sa.tailnum
FROM StagingArea.dbo.goodFlightsData sa
LEFT JOIN SourceSysyems.dbo.PlaneData sp ON sa.tailnum = sp.tailnum
WHERE sp.tailnum IS NULL;

-- Ensure you are using the correct database context for StagingArea
USE StagingArea;

-- Select tailnum values from goodFlightsData that do not exist in PlaneData and are not 'John Doe'
SELECT sa.tailnum
FROM StagingArea.dbo.goodFlightsData sa
LEFT JOIN SourceSysyems.dbo.PlaneData sp ON sa.tailnum = sp.tailnum
WHERE sp.tailnum IS NULL
  AND sa.tailnum != 'John Doe';
```
