---
title: "NetOnNet: E-Commerce Database Design"
category: Data Analytics & BI
subcategory: Relational Database Design & Dimensional Modeling
track: Educational Projects
source: Nackademin
context: Database Design and Modeling
tags:
  - ERD
  - Normalization
  - Star Schema
  - Snowflake Schema
  - T-SQL
  - Group Project
  - Miro
date: 20 January 2024
note: >-
  A group database design project (4 members) for my Database Design and
  Modeling course at Nackademin: designing a full relational schema for a
  fictional electronics retailer, NetOnNet, from scratch, then converting it
  into a dimensional model for reporting.


  The OLTP schema centers on Product as the anchor entity, with category and subcategory tables in a one-to-many hierarchy, and separate tables handling inventory tracking, discounts, product descriptions, images, and reviews. On the customer side, a bridge table (ProductOrder) connects orders to products, with supporting tables for payment type, invoicing, customer accounts (private vs. business), and login credentials kept in a separate AccountDetails table for basic access control. We used Miro as a shared whiteboard to design and iterate on the ERD collaboratively in real time, including comparing competing SQL approaches and data type choices (e.g., settling on NVARCHAR over TEXT for performance reasons).


  The project concludes with a dimensional model: an OrderFact table surrounded by CustomerDim, ProductDim, DateDim, OrderDim, and ImageDim, with ImageDim linked through ProductDim rather than directly to the fact table, a snowflaked design choice that keeps the model normalized at that one point.
metrics:
  - label: ERD
    value: 20 Normalized OLTP Tables
  - label: Assortment
    value: 66 Products Across 6 Categories / 16 Subcategories
  - label: Star/Snowflake Conversion
    value: 1 Fact Table (OrderFact) + 5 Dimensions (CustomerDim, ProductDim,
      DateDim, OrderDim, ImageDim)
cover: /uploads/skärmbild-2026-08-03-150143.png
images:
  - /uploads/netonnet-2.png
---
## Design Decisions

**Process.** The team worked iteratively, returning to earlier decisions repeatedly to refine and correct the model rather than finalizing sections in one pass. Everyone first read the assignment independently and thought about candidate entities before the group came together to build the ERD collaboratively. The ERD started in draw.io but was moved to Miro, a shared online whiteboard, so all four members could edit simultaneously, leave comments on open questions, and share code snippets directly on the board. This let the team compare notes in real time, for example, when deciding between `TEXT` and `VARCHAR`/`NVARCHAR(MAX)` for text fields, they researched the tradeoff together and settled on `NVARCHAR` for better performance and more efficient data handling, documenting the reasoning on the whiteboard so everyone could follow the decision. When two people wrote different-looking SQL for the same requirement, they checked with ChatGPT to confirm both versions were functionally equivalent before picking one.

**Product as the anchor entity.** The design started from `Product`, since a store can't exist without something to sell. Its attributes are `ProductName`, `Brand`, `SalesPrice`, `InStock`, and a foreign key to `SubCategory`.

**Category hierarchy.** `SubCategory` has a one-to-many relationship with `Product` (a product belongs to exactly one subcategory, a subcategory can hold many products), and `Category` has the same one-to-many relationship with `SubCategory`. This gives a clean two-level classification hierarchy.

**Inventory tracking.** `Inventory` is linked to `Product` in a one-to-many relationship so the team could track units moving in and out of stock over time. A date attribute on each inventory record marks when a given stock change occurred.

**Discounts.** A `Discount` table is linked to `Product` to handle price reductions, with a foreign key to `DiscountType` so different discount categories (e.g., special offer, seasonal clearance, stock clearance) can be distinguished and each discount tied to both the product it applies to and its type.

**Descriptions and images.** `Description` is linked to `Product` and given a large `varchar(2000)` field to hold enough text for a full product description. `Description` in turn relates to `Image`, a one-to-many (or zero) relationship, since a description can have several images or none at all.

**Reviews.** `Review` has a foreign key to `ProductID` so users can review products, but deliberately includes no user-verification field, anyone can leave a name and review text. This was a conscious choice to let customers review anonymously without requiring an authenticated identity.

**Order structure and the bridge table.** To capture which products were included in which order, the team built a bridge table (`ProductOrder`) holding foreign keys to both `Order` and `Product`. This lets the schema represent all the relevant data for an order rather than conflating separate orders. The `Order` table itself holds a foreign key to `Customer` (who placed the order) and to `PaymentType` (how they paid), plus an order date. An early design had a `FinalPrice` field directly on the bridge table to account for discounts, but the team replaced this with a stored procedure that multiplies a product's price by quantity and applies any active discount, falling back to `quantity × sales price` when no discount applies.

**Payment and invoicing.** `PaymentType` only tracks the payment method (e.g., direct payment vs. invoice). `Order` connects to `Invoice` to track whether a bill has been paid and its due date, `DateIssued` marks the purchase date and `DueDate` the invoice's payment deadline.

**Customer and address separation.** `Customer` holds contact details; address information was deliberately split into its own table with a foreign key back to `Customer`, rather than embedding address fields directly on the customer record.

**Accounts and login.** The store supports two account types, private and business, tracked via an `AccountType` foreign key on the `Account` table (alongside a foreign key to `Customer`, `DateCreated`, `LastLoginDate`, and `AccountStatus`). Login credentials (`UserName`, `Password`) were split out into a separate `AccountDetails` table rather than stored on `Account` itself, making that sensitive data less directly accessible.

**Dimensional model.** The team finished by building a snowflake-leaning star schema for reporting. The original plan was to use `Product` as the fact table, but the team changed direction partway through and used `Order` as the fact table instead. The final model has one fact table (`OrderFact`) and five dimensions: `OrderDim`, `DateDim`, `ProductDim`, `CustomerDim`, and `ImageDim`. Notably, `ImageDim` connects through `ProductDim` rather than directly to the fact table, a deliberate snowflake at that one point in an otherwise star-shaped model.

### 1. OLTP Schema: Table Creation

```
CREATE DATABASE NetOnNet
Go
USE NetOnNet

create table Category
(
CategoryID int identity (1,1) primary key,
CategoryName nvarchar (50) not null
)

create table SubCategory
(
SubCategoryID int identity (1,1) primary key,
CategoryID int foreign key references Category(CategoryID) not null,
SubCategoryName nvarchar (50) not null
)

create table Product --- Primary table
(
ProductID int identity (1,1) primary key,
SubCategoryID int foreign key references SubCategory(SubCategoryID) not null,
Brand nvarchar (50) not null,
ProductName nvarchar (50) not null,
SalesPrice float not null,
InStock bit not null
)

Create table AccountType
(AccountTypeID int identity (1,1) primary key,
AccountType nvarchar (20) not null)

Create table Customer
(
CustomerID	int	identity (1,1) primary key,
[Name]		nvarchar (20) not null,
MiddleName	nvarchar (20),
LastName	nvarchar (20) not null,
Mail		nvarchar (50) not null,
Phone		nvarchar (50) not null
)

Create table Account
(
AccountID		int identity (1,1) primary key,
CustomerID		int foreign key references Customer(CustomerID)			not null,
AccountTypeID	int foreign key references AccountType(AccountTypeID)	not null,
DateCreated		date not null,
LastLoginDate	datetime,
AccountStatus	varchar (20) default 'Active'
)

CREATE TABLE PaymentType
(
PaymentTypeID int PRIMARY KEY IDENTITY(1,1),
PaymentType nvarchar(30) not null
)

Create table [Order]
(
OrderID int identity (1,1)  primary key,
CustomerID int foreign key references Customer(CustomerID) not null,
PaymentTypeID int FOREIGN KEY REFERENCES PaymentType(PaymentTypeID),
OrderDate date not null,
)

--Create BridgeTable
create table ProductOrder
(
ProductID int foreign key references Product(ProductID) not null,
OrderID int  foreign key references [Order](OrderID) not null,
Quantity int not null,
)

Create table AccountDetails
(
AccountID int primary key Foreign key references Account(AccountID),
UserName nvarchar (50),
[Password] nvarchar (50),
)

Create table Invoice
(
OrderID int PRIMARY KEY FOREIGN KEY REFERENCES [Order](OrderID) not null,
BillingStatus bit not null,
DateIssued date not null,
DueDate date not null
)

Create table [Address]
(AddressID int identity (1,1) primary key,
CustomerID int foreign key references Customer(CustomerID) not null,
City nvarchar (50) not null,
Street nvarchar (50) not null,
Zip nvarchar (50) not null)

CREATE TABLE Inventory
(
InventoryID int PRIMARY KEY IDENTITY(1,1),
ProductId int FOREIGN KEY REFERENCES Product(ProductID) NOT NULL,
UnitBalance int NOT NULL,
UnitsIn int,
UnitsOut int,
UnitsPrice float NOT NULL,
InventoryDate date NOT NULL,
)

CREATE TABLE DiscountType
(
DiscountTypeID int PRIMARY KEY IDENTITY(1,1),
DiscountDescription nvarchar(50)     -- Text typen är tydligen gammal och oeffektiv
)

CREATE TABLE Discount
(
DicountID int PRIMARY KEY IDENTITY(1,1),
DiscountTypeID int FOREIGN KEY REFERENCES DiscountType(DiscountTypeID) NOT NULL,
ProductID int FOREIGN KEY REFERENCES Product(ProductID) NOT NULL,
DiscountAmount float NOT NULL,
StartDate date NOT NULL,
EndDate date NOT NULL
)

CREATE TABLE [Description]
(
ProductID int PRIMARY KEY FOREIGN KEY REFERENCES Product(ProductID),
ProductDescription nvarchar(500) NOT NULL
)

CREATE TABLE Image
(
ImageID int PRIMARY KEY IDENTITY(1,1),
ProductID int FOREIGN KEY REFERENCES [Description](ProductID) NOT NULL,
ImageLink varchar(200) NOT NULL
)

CREATE TABLE Review
(
ReviewID int PRIMARY KEY IDENTITY(1,1),
ProductID int FOREIGN KEY REFERENCES Product(ProductID),
ReviewerName nvarchar(50) NOT NULL,
ReviewText nvarchar(300) NOT NULL
)
```

### 2. OLTP Schema: Sample Data Inserts

**Category & SubCategory**

```
insert into Category (CategoryName)
values
('Computer'),
('Smartphones'),
('Headphones'),
('TV'),
('Speakers'),
('VacuumCleaner')

insert into SubCategory (CategoryID,SubCategoryName)
values
(1, 'Laptop'),
(1, 'DesktopComputer'),
(1, 'Tablet'),
(2, 'iPhone'),
(2, 'Samsung'),
(2, 'Sony'),
(3, 'WirelessHeadphones'),
(3, 'WiredHeadphones'),
(3, 'SportsHeadphones'),
(4, 'OLED'),
(4, 'QLED'),
(5, 'BluetoothSpeakers'),
(5, 'ComputerSpeakers'),
(5, 'SmartSpeakers'),
(6, 'RoboticVacuumCleaner'),
(6, 'HandheldVacuumCleaner')
```

**Products (66 products across 16 subcategories)**

```
insert into Product (SubCategoryID, Brand, ProductName, SalesPrice, InStock)
values
(1, 'Acer', 'Acer Nitro 5', 19990.0, 1),--Laptop 1
(1, 'Acer', 'Acer Nitro 17', 21990.0, 1), --2
(1, 'Asus', 'Asus G814JI', 24990.0, 1), --3
(1, 'Asus', 'Asus TUF 15', 34990.0, 1), --4
(1, 'Lenovo', 'Lenovo Legion Slim 5', 19990.0, 1), --5
(1, 'Hp', 'Hp Omen 16', 12990.0, 1), --6
```

**Inventory (two weekly stock counts across all 66 products)**

```
--Vi har ett lager med 66 unika produkter.
--En gång i vecka, på måndag, genomför vi en inventering av vårt lager.
--Där vi kollar hur många produkter har vi  på lager till det datumet.
--Vi kollar hur många produkter var sålda/retunerade under den vecka.
--Totalt har data på 2 veckor.

--V nr.1, måndag 2024-01-22
INSERT INTO Inventory (ProductId, UnitBalance, UnitsIn, UnitsOut, UnitsPrice, InventoryDate)
VALUES
(1, 50, 50, NULL, 13000.0, '2024-01-22'),
(2, 50, 20, 1, 19000.0, '2024-01-22'),--retur till leverantör
(3, 50, 30, 1, 20000.0, '2024-01-22'), --har order 1st
(4, 40, 40, 1, 30000.0, '2024-01-22'),--retur
(5, 40, 15, NULL, 13000.0, '2024-01-22'),
(6, 40, 5, 1, 7000.0, '2024-01-22'),--har order 1st
(7, 30, 4, NULL, 6000.0, '2024-01-22'),
(8, 30, 10, NULL, 9000.0, '2024-01-22'),
(9, 20, 5, 1, 13000.0, '2024-01-22'),--har order 1st
(10,20, 5, 1, 4000.0, '2024-01-22'),--har order 1st

(1, 100, 5, NULL, 13000.0, '2024-01-29'),
(2, 69, 5, NULL, 19000.0, '2024-01-29'),
(3, 79, 3, 5, 20000.0, '2024-01-29'),
(4, 79, 2, NULL, 30000.0, '2024-01-29'),
(5, 55,3, 8, 13000.0, '2024-01-29'),
(6, 44, 3, NULL, 7000.0, '2024-01-29'),
(7, 34, 5, 12, 6000.0, '2024-01-29'),
(8, 40, 22, NULL, 9000.0, '2024-01-29'),
(9, 24, 10, 1, 13000.0, '2024-01-29'),
(10,24, 30, NULL, 4000.0, '2024-01-29'),

(11, 22, 5, 2, 5000.0, '2024-01-29'),
(12, 25, 5, NULL, 900.0, '2024-01-29'),
(13, 41, 5, 1, 800.0, '2024-01-29'),
(14, 15, 5, NULL, 6000.0, '2024-01-29'),
(15, 22, 15, 1, 3500.0, '2024-01-29'),
(16, 29, 7, NULL, 8000.0, '2024-01-29'),
(17, 43, 15, 1, 9000.0, '2024-01-29'),
(18, 40, 4, 1, 9000.0, '2024-01-29'),
(19, 30, 5, NULL, 5000.0, '2024-01-29'),
(20, 28, 4, 1, 10000.0, '2024-01-29'),

(21, 13, 10, 4, 3000.0, '2024-01-29'),
(22, 15, 10, 6, 4000.0, '2024-01-29'),
(23, 20, 10, 1, 6000.0, '2024-01-29'),
(24, 20, 15, 5, 8000.0, '2024-01-29'),
(25, 30, 15, NULL, 5000.0, '2024-01-29'),
(26, 29, 10, 1, 2000.0, '2024-01-29'),
(27, 45, 6, 2, 700.0, '2024-01-29'),
(28, 39, 8, 1, 400.0, '2024-01-29'),
(29, 45, 5, NULL, 1500.0, '2024-01-29'),
(30, 53, 4, 1, 800.0, '2024-01-29'),

(31, 33, 5, 1, 900.0, '2024-01-29'),
(32, 45, 5, 1, 600.0, '2024-01-29'),
(33, 39, 10, 1, 300.0, '2024-01-29'),
(34, 23, 5, 2, 150.0, '2024-01-29'),
(35, 24, 15, 1, 350.0, '2024-01-29'),
(36, 30, 10, NULL, 900.0, '2024-01-29'),
(37, 43, 15, 2, 800.0, '2024-01-29'),
(38, 40, 10, NULL, 800.0, '2024-01-29'),
(39, 55, 5, NULL, 9000.0, '2024-01-29'),
(40, 28, 4, 1, 18000.0, '2024-01-29'),

(41, 49, 10, 2, 8000.0, '2024-01-29'),
(42, 34, 5, NULL, 10000.0, '2024-01-29'),
(43, 39, 10, 1, 3000.0, '2024-01-29'),
(44, 29, 5, NULL, 4000.0, '2024-01-29'),
(45, 22, 15, 3, 7000.0, '2024-01-29'),
(46, 30, 10, NULL, 7000.0, '2024-01-29'),
(47, 43, 15, 2, 1500.0, '2024-01-29'),
(48, 37, 10, 1, 4000.0, '2024-01-29'),--order 1 st
(49, 20, 5, NULL, 3000.0, '2024-01-29'),
(50, 18, 4, 1, 1700.0, '2024-01-29'),

(51, 33, 15, 1, 3000.0, '2024-01-29'),
(52, 50, 10, NULL, 3500.0, '2024-01-29'),
(53, 29, 15, 1, 900.0, '2024-01-29'),-- order 1 st
(54, 25, 15, NULL, 600.0, '2024-01-29'),
(55, 34, 15, 1, 2000.0, '2024-01-29'),
(56, 18, 10, 2, 450.0, '2024-01-29'),
(57, 24, 15, 1, 2500.0, '2024-01-29'),
(58, 10, 5, 5, 3500.0, '2024-01-29'),
(59, 39, 5, 1, 4000.0, '2024-01-29'),
(60, 34, 10, 1, 1700.0, '2024-01-29'),

(61, 23, 5, NULL, 2000.0, '2024-01-29'),
(62, 25, 5, 1, 3500.0, '2024-01-29'),
(63, 39, 10, 1, 3000.0, '2024-01-29'),
(64, 15, 5, NULL, 3000.0, '2024-01-29'),
(65, 22, 15, NULL, 2000.0, '2024-01-29'),
(66, 29, 10, 1, 2000.0, '2024-01-29')
```

**Reviews (including a handful of deliberately negative reviews)**

```
insert into Review (ProductID, ReviewerName, ReviewText)
values
-- Laptops
(1, 'Alice', 'Impressive performance and sleek design. Acer Nitro 5 exceeded my expectations.'),
(2, 'Bob', 'Acer Nitro 17 is a powerhouse with a large display. Perfect for gaming and productivity.'),
(3, 'Charlie', 'Asus G814JI delivers top-notch performance. Great for gaming enthusiasts.'),
(4, 'David', 'Asus TUF 15 offers durability and high-speed performance. A reliable choice for gamers.'),
(5, 'Eva', 'Lenovo Legion Slim 5 is ultra-slim and powerful. Ideal for on-the-go professionals.'),
(6, 'Frank', 'Hp Omen 16 provides an immersive gaming experience with its powerful specs.'),

--Reviews for Tablet
(10, 'Alice', 'The Apple iPad Air 5th gen is an incredible tablet with a stunning display and powerful performance.'),
(11, 'Bob', 'The Apple iPad 9th gen offers great value for money with its sleek design and smooth user experience.'),
(12, 'Charlie', 'Lenovo M8 4th Gen 8 is a budget-friendly tablet with decent performance for everyday use.'),
(13, 'David', 'Lenovo M8 4th Gen 8 provides good value for the price, especially considering its features.'),
(14, 'Eva', 'Samsung Galaxy Tab S8 stands out with its premium build quality and impressive display.'),
(15, 'Frank', 'Google Pixel Tablet 11 is a sleek and powerful device, perfect for productivity and entertainment.'),
-- Reviews for iPhone
(16, 'Grace', 'The Apple iPhone 15 Pro is a flagship device with a stunning camera and high-end performance.'),
(17, 'Harry', 'Apple iPhone 14 delivers a sleek design and advanced features for a premium smartphone experience.'),
(18, 'Ivy', 'Apple iPhone 14 Plus impresses with its large display and powerful internals, perfect for multimedia.'),
(19, 'Jack', 'Apple iPhone 13 offers excellent value for money with a reliable camera and smooth performance.'),
-- Reviews for Samsung smartphones
(20, 'Karen', 'Samsung Galaxy S23 Ultra sets a new standard for flagship smartphones with its impressive camera system.'),
(21, 'Leo', 'Samsung Galaxy A34 5G offers excellent value for its price, providing 5G capabilities at an affordable cost.'),
(22, 'Mia', 'Samsung Galaxy A54 5G combines sleek design with reliable performance for a great mid-range smartphone experience.'),
-- Reviews for Sony smartphones
(23, 'Natalie', 'Sony Xperia 5 offers a compact design with powerful performance, making it a great choice for on-the-go users.'),
(24, 'Oliver', 'Sony Xperia 1 V 12GB stands out with its impressive capacity and high-end features for a premium experience.'),
(25, 'Penelope', 'Sony Xperia 5 V 8GB provides a balanced blend of performance and value, catering to a wide range of users.'),
-- Reviews for Wireless Headphone products
(26, 'Quentin', 'Apple AirPods Pro deliver exceptional sound quality and noise cancellation, setting a high standard for wireless earbuds.'),
(27, 'Rachel', 'Philips TAK4607GY offers a budget-friendly option with clear audio and comfortable fit for everyday use.'),
(28, 'Samuel', 'JBL Wave Buds provide a compact and portable solution with good sound quality and reliable connectivity.'),
(29, 'Tanya', 'Samsung Galaxy Buds2 Pro Graphite impresses with its stylish design and advanced features for a premium wireless experience.'),
(30, 'Ursula', 'Samsung Buds FE offer a great balance between performance and affordability, making them a popular choice for everyday use.'),
-- Reviews for Wired Headphone products
(31, 'Vivian', 'Philips SHD8850 offers a comfortable fit and clear sound quality, making it a reliable choice for wired headphone enthusiasts.'),
(32, 'William', 'Philips Fidelio X2HR provides an immersive audio experience with its open-back design and high-quality sound reproduction.'),
(33, 'Xander', 'JBL JR310 is a great option for young listeners with its durable build and volume limitations suitable for children.'),
(34, 'Yara', 'Sony MDR-ZX310 delivers budget-friendly wired headphone performance with clear and balanced sound.'),
-- Reviews for Sports Headphone products
(35, 'Zack', 'Jabra Elite 3 is an excellent choice for sports enthusiasts, providing a secure fit and reliable sound quality during workouts.'),
(36, 'Amy', 'Marshall Motif ANC offers active noise cancellation for an immersive music experience during workouts and outdoor activities.'),
(37, 'Ben', 'JBL Wave Flex is a versatile option for sports with its flexible design and reliable performance in various conditions.'),
(38, 'Cara', 'Sony LinkBuds S are lightweight sports headphones with a comfortable fit, making them suitable for active lifestyles.'),
-- Reviews for OLED TV products
(39, 'Dylan', 'Philips 55OLED708/12 offers stunning visuals with vibrant colors and deep blacks, providing an excellent OLED TV experience.'),
(40, 'Eva', 'Samsung TQ77S93CATXXC is a premium OLED TV with impressive picture quality and smart features for an immersive home theater experience.'),
(41, 'Felix', 'Samsung TQ77S93CATXXC combines sleek design with reliable performance, making it a great choice for a high-quality OLED TV.'),
(42, 'Grace', 'Sony XR-48A90K delivers exceptional clarity and detail in a compact size, making it an ideal choice for those with limited space.'),
-- Reviews for QLED TV products
(43, 'Henry', 'Toshiba 43QA7D63DG provides vibrant colors and sharp images, offering an affordable option for QLED TV enthusiasts.'),
(44, 'Isabella', 'Toshiba 50QA7D63DG delivers an immersive viewing experience with its large display and impressive QLED technology.'),
(45, 'Jackie', 'Samsung QE55Q80BATXXC offers excellent picture quality and advanced features, making it a top choice for QLED TV enthusiasts.'),
(46, 'Kevin', 'Samsung TQ43Q64CAUXXC combines sleek design with reliable performance, providing a great QLED TV experience at an affordable price.'),
-- Reviews for Bluetooth Speaker products
(47, 'Liam', 'Audio Pro C3 is a compact Bluetooth speaker with impressive sound quality and a stylish design.'),
(48, 'Mia', 'Audio Pro A38 offers a premium audio experience with its powerful sound output and sleek build.'),
(49, 'Noah', 'Marshall Woburn II BT delivers a vintage aesthetic combined with modern Bluetooth capabilities for a unique audio experience.'),
(50, 'Olivia', 'JBL Xtreme 3 provides a portable and rugged option with excellent battery life, perfect for outdoor use.'),
-- Reviews for Computer Speaker products
(51, 'Pamela', 'Klipsch Heritage ProMedia 2.1 delivers rich and immersive sound, making it an excellent choice for computer audio enthusiasts.'),
(52, 'Quincy', 'Klipsch R-51PM offers a compact design with powerful audio performance, perfect for desktop setups.'),
(53, 'Rachel', 'Logitech Z623 provides a high-quality audio experience with deep bass and clear sound reproduction for an immersive gaming experience.'),
(54, 'Samuel', 'Logitech Z533 delivers reliable performance and a stylish design, making it a great option for computer speakers.'),
-- Reviews for Smart Speaker products
(55, 'Tom', 'Google Nest Audio provides a smart and connected audio experience with excellent sound quality for your home.'),
(56, 'Ursula', 'Google Nest Mini offers a compact and affordable option with smart features, perfect for smaller spaces.'),
(57, 'Victor', 'Apple HomePod impresses with its seamless integration with Apple devices and high-quality sound reproduction.'),
(58, 'Wendy', 'Bose Home Speaker 500 delivers a premium smart speaker experience with expansive sound and sleek design.'),
-- Reviews for Robotic Vacuum Cleaner products
(59, 'Xena', 'Roborock S8 is an efficient robotic vacuum cleaner with advanced navigation and cleaning capabilities, making it a smart choice for automated cleaning.'),
(60, 'Yannick', 'Andersson RTR-W2000 offers a budget-friendly option with reliable performance for keeping your home clean.'),
(61, 'Zara', 'Dreame D9 M combines smart features with powerful cleaning performance, providing an effective solution for maintaining a tidy home.'),
(62, 'Adam', 'iRobot Roomba i3154 is a popular choice for its intelligent mapping and efficient cleaning, making it a reliable robotic vacuum cleaner.'),
-- Reviews for Handheld Vacuum Cleaner products
(63, 'Bella', 'Dyson V10 Origin delivers powerful suction in a handheld vacuum, making it versatile for quick and efficient cleaning.'),
(64, 'Charlie', 'Dyson V8 Absolute is a lightweight and convenient handheld vacuum with strong suction for various cleaning needs.'),
(65, 'Diana', 'Samsung Jet 75 Multi offers multiple cleaning attachments for versatile handheld vacuum cleaning.'),
(66, 'Ethan', 'OBH Nordica 234X is a reliable and affordable handheld vacuum cleaner with practical features for everyday use.'),
--Negative Reviews
(2,'Nancy', 'I purchased Asus G814JI with high expectations, but unfortunately, it has not lived up to them. The performance is subpar for the price, and Ive encountered issues with overheating.'),
(12, 'Oliver', 'I had high hopes for the Lenovo M8 4th Gen 8, but unfortunately, it has been a disappointment'),
(16, 'Sophia', 'Disappointed. Short battery life, overheating, and camera falls short. Price not justified.'),
(63, 'Megan', 'Unimpressed with the Dyson V10 Origin. Suction power is lacking. Expected better performance for the price.'),
(49, 'Alex', 'Disappointed with the Marshall Woburn II BT Bluetooth Speakers. Audio quality is subpar.')
```

**Discounts**

```
values
('Special Offer'),    --Special Erbjudanden Valfri %
('Seasonal Clearance'), -- Säsongsutförsäljning/ 50%
('Stock Clearance') -- Lagerrensning / 30%

insert into Discount (DiscountTypeID, ProductID, DiscountAmount, StartDate, EndDate)
values
(1, 1, 0.85, '2024-01-08', '2024-01-31'),  -- Special Offer, start 8 januari, slut 31 januari
(1, 2, 0.85, '2024-01-08', '2024-01-31'),
(1, 7, 0.85, '2024-01-08', '2024-01-31'),
(1, 10, 0.85, '2024-01-08', '2024-01-31'),
(1, 16, 0.85, '2024-01-08', '2024-01-31'),
(1, 20, 0.85, '2024-01-08', '2024-01-31'),
```

**Descriptions & Images**

```
INSERT INTO [Description]
Values
(1, 'A gaming laptop with a 15.6-inch display, 8GB RAM, and 512GB SSD storage.'),
(2, 'A gaming laptop with a 17.3-inch display, 8GB RAM, and 512GB SSD storage.'),
(3, 'A gaming laptop with a 14-inch display, 16GB RAM, and 1TB SSD storage.'),
(4,'A gaming laptop with a 15.6-inch display, 16GB RAM, and 512GB SSD storage.'),
(5,'A gaming laptop with a 15.6-inch display, 8GB RAM, and 512GB SSD storage.'),
(6,'A gaming laptop with a 16.1-inch display, 16GB RAM, and 512GB SSD storage.'),

(7,'An all-in-one desktop computer with a 27-inch display, 8GB RAM, and 512GB SSD storage.'),
(8,'An all-in-one desktop computer with a 23.8-inch display, 8GB RAM, and 256GB SSD storage.'),
(9,'An all-in-one desktop computer with a 24-inch display, 8GB RAM, and 256GB SSD storage.'),

(10,'A tablet with a 10.9-inch display, 64GB storage, and Wi-Fi connectivity.'),
(11,'A tablet with a 10.2-inch display, 64GB storage, and Wi-Fi connectivity.'),
(12,'A tablet with an 8-inch display, 2GB RAM, and 32GB storage.'),
(13,'A tablet with an 8-inch display, 3GB RAM, and 32GB storage.'),
(14,'A tablet with an 8.4-inch display, 128GB storage, and Wi-Fi connectivity.'),
(15,'A tablet with an 11-inch display, 128GB storage, and Wi-Fi connectivity.'),

(16,'A smartphone with a 6.1-inch display, 128GB storage, and 5G connectivity.'),
(17,'A smartphone with a 6.1-inch display, 64GB storage, and 5G connectivity.'),
(18,'A smartphone with a 6.7-inch display, 128GB storage, and 5G connectivity.'),
(19,'A smartphone with a 6.1-inch display, 128GB storage, and 5G connectivity.'),

(20,'A smartphone with a 6.8-inch display, 256GB storage, and 5G connectivity.'),
(21,'A smartphone with a 6.5-inch display, 128GB storage, and 5G connectivity.'),
(22,'A smartphone with a 6.5-inch display, 128GB storage, and 5G connectivity.'),

(23,'A smartphone with a 6.1-inch display, 128GB storage, and 5G connectivity.'),
(24,'A smartphone with a 6.5-inch display, 12GB RAM, and 512GB storage.'),
(25,'A smartphone with a 6.1-inch display, 8GB RAM, and 128GB storage.'),

(26,'Wireless earbuds with active noise cancellation and up to 4.5 hours of listening time.'),
(27,'Over-ear headphones with a 1.2m cable and 32mm drivers.'),
(28,'Wireless earbuds with a 22-hour battery life and IPX7 water resistance.'),
(29,'Wireless earbuds with active noise cancellation and up to 5 hours of listening time.'),
(30,'Wireless earbuds with up to 6 hours of listening time and IPX2 water resistance.'),

(31,'Over-ear headphones with a wireless range of up to 30 meters and a 20-hour battery life.'),
(32,'Over-ear headphones with 50mm drivers and a 3.5mm jack.'),
(33,'On-ear headphones with a 1.2m cable and a 3.5mm jack.'),
(34,'On-ear headphones with a 1.2m cable and 30mm drivers.'),

(35,'These are sports headphones that come with a secure fit and a customizable equalizer. They are designed to provide a comfortable and stable fit during workouts and come with a 2-year warranty.'),
(36,'These are noise-canceling headphones that come with a 20-hour battery life and a collapsible design. They also feature a multi-directional control knob that allows you to control your music and phone calls.'),
(37,'These are wireless headphones that come with a 30-hour battery life and a foldable design. They also feature a multi-point connection that allows you to switch between devices seamlessly.'),
(38,'These are wireless earbuds that come with a 9-hour battery life and a compact design. They also feature a touch sensor that allows you to control your music and phone calls.'),

(39,'This is a 55-inch OLED TV with 4K resolution and Ambilight technology. It has a P5 AI Perfect Picture Engine, Dolby Atmos sound, and Google TV.'),
(40,'This is a 77-inch OLED Smart 4K TV with Quantum Dot technology. It has a Neural Quantum Processor 4K, XR OLED Contrast Pro, and Acoustic Surface Audio+. It supports HDMI 2.1 in all HDMI ports.'),
(41,'This is a 77-inch OLED Smart 4K TV with Quantum Dot technology. It has a Neural Quantum Processor 4K, XR OLED Contrast Pro, and Acoustic Surface Audio+. It supports HDMI 2.1 in all HDMI ports.'),
(42,'This is a 48-inch OLED TV with 4K resolution and Cognitive Processor XR. It has XR OLED Motion, XR OLED Contrast Pro, and Acoustic Surface Audio+.'),

(43,'This is an OLED TV that comes with a 55-inch display and a 4K resolution. It also features Ambilight technology that creates an immersive viewing experience by projecting light around the TV.'),
(44,'This is a QLED TV that comes with a 75-inch display and a 4K resolution. It also features Quantum HDR 2000 technology that provides a wider range of brightness and contrast levels.'),
(45,'This is an OLED TV that comes with a 48-inch display and a 4K resolution. It also features Acoustic Surface Audio technology that provides an immersive audio experience by using the screen as a speaker.'),
(46,'This is a QLED TV that comes with a 43-inch display and a 4K resolution. It also features Dolby Vision HDR technology that provides a wider range of brightness and contrast levels.'),

(47,'This is a Bluetooth speaker that comes with a 15-hour battery life and a compact design. It also features a multi-room function that allows you to connect multiple speakers together.'),
(48,'This is a Bluetooth speaker that comes with a 25-hour battery life and a sleek design. It also features a multi-room function that allows you to connect multiple speakers together.'),
(49,'This is a Bluetooth speaker that comes with a 20-hour battery life and a classic design. It also features a multi-host function that allows you to connect two Bluetooth devices at the same time.'),
(50,'This is a Bluetooth speaker that comes with a 15-hour battery life and a waterproof design. It also features a PartyBoost function that allows you to connect multiple JBL speakers together.'),

(51,'These are computer speakers that come with a 200-watt digital amplifier and a subwoofer. They also feature Klipsch's exclusive horn-loaded technology that provides high-quality sound.'),
(52,'These are computer speakers that come with a built-in amplifier and a sleek design. They also feature a phono preamp that allows you to connect a turntable.'),
(53,'These are computer speakers that come with a 200-watt RMS power and a THX certification. They also feature a 3.5mm and RCA inputs that allow you to connect multiple devices.'),
(54,'These are computer speakers that come with a 120-watt peak power and a compact design. They also feature a 3.5mm and RCA inputs that allow you to connect multiple devices.'),

(55,'This is a smart speaker that comes with a 24-hour battery life and a compact design. It also features Google Assistant that allows you to control your smart home devices.'),
(56,'This is a smart speaker that comes with a 40% stronger bass and a compact design. It also features Google Assistant that allows you to control your smart home devices.'),
(57,'This is a smart speaker that comes with a high-excursion woofer and a custom amplifier. It also features Siri that allows you to control your smart home devices.'),
(58,'This is a smart speaker that comes with an eight-microphone array and a sleek design. It also features Alexa and Google Assistant that allows you to control your smart home devices.'),

(59,'This is a robotic vacuum cleaner that comes with a 5200mAh battery and a 300ml water tank. It also features a 3-stage cleaning system that provides a thorough cleaning experience.'),
(60,'This is a robotic vacuum cleaner that comes with a 2200mAh battery and a 600ml dustbin. It also features a 3-stage cleaning system that provides a thorough cleaning experience.'),
(61,'This is a robotic vacuum cleaner that comes with a 5200mAh battery and a 570ml dustbin. It also features a 3-stage cleaning system that provides a thorough cleaning experience.'),
(62,'This is a robotic vacuum cleaner that comes with a 1800mAh battery and a 400ml dustbin. It also features a 3-stage cleaning system that provides a thorough cleaning experience.'),

(63,'This is a handheld vacuum cleaner that comes with a 60-minute battery life and a powerful suction. It also features a hygienic point-and-shoot bin emptying system that allows you to dispose of the dirt without touching it.'),
(64,'This is a handheld vacuum cleaner that comes with a 40-minute battery life and a powerful suction. It also features a hygienic point-and-shoot bin emptying system that allows you to dispose of the dirt without touching it.'),
(65,'This is a handheld vacuum cleaner that comes with a 60-minute battery life and a powerful suction. It also features a washable filter that captures 99.999% of dust and allergens.'),
(66,'This is a handheld vacuum cleaner that comes with a 20-minute battery life and a compact design. It also features a washable filter that captures 99.5% of dust and allergens.')

INSERT INTO Image (ProductID, ImageLink)
VALUES
(1,'https://avatars.mds.yandex.net/get-mpic/5219318/img_id6331158175047946252.png/orig') ,
(16, 'https://www.theapplepost.com/wp-content/uploads/2023/02/4B3DE31A-E802-409E-91E5-31313A43C3E1.jpg'),
(20, 'https://www.notebookcheck.net/fileadmin/Notebooks/News/_nc3/Galaxy_S23_Ultra_concept_dimensions_display_specs_S23_S23_plus_drdNBC_6.jpg'),
(63, 'https://img.joomcdn.net/ce72d1204888e96b7945a4d6fa57a8a30941d2ae_original.jpeg'),
(63, 'https://i-lite.ru/wp-content/uploads/2022/07/dyson-cyclone-v10-animal2.jpg'),
(2,'https://www.pngall.com/wp-content/uploads/2016/05/Laptop-Free-Download-PNG.png')
```

**Customers, Accounts & Payment**

```
insert into Customer
values
('Eva', NULL, 'Andersson', 'eva.andersson2012@gmail.com', '+46 70 123 45 67'), --1
('Carl', 'Anders', 'Johansson', 'carl.johansson23@yahoo.com', '+46 70 987 65 43'), --2
('Anna', NULL, 'Larsson', 'anna.larsson1980@gmail.com', '+46 8 111 22 33'),--Business customer 3
('Göran', 'Stefan', 'Nilsson', 'goran.nilsson1254@hotmail.com', '+46 70 444 55 66'), --4
('Karin', 'Eva', 'Eriksson', 'karin.eriksson@hotmail.com', '+46 8 777 88 99'),--Business customer 5
('Oskar', NULL, 'Karlsson', 'oskar.karlsson23@gmail.com', '+46 70 123 45 67'), --6
('Sofia', 'Birgitta', 'Berg', 'sofia.berg34@yahoo.com', '+46 70 987 65 43'), --7
('Daniel', 'Patrik', 'Persson', 'daniel.persson301@hotmail.com', '+46 8 111 22 33'),--Business customer 8
('Maria', 'Louise', 'Lind', 'maria.lind@hotmail.com', '+46 70 444 55 66'), --9
('Anders', 'Mikael', 'Månsson', 'anders.mansson78@gmail.com', '+46 8 777 88 99'),--Business customer 10
('Elin', NULL, 'Svensson', 'elin.svensson@gmail.com', '+46 70 123 45 67'), --11
('Nils', 'Gustav', 'Gustafsson', 'nils.gustafsson85@yahoo.com', '+46 70 987 65 43'), --12
('Johan', 'Fredrik', 'Larsson', 'johan.larsson@gmail.com', '+46 70 111 22 33'),--Business customer 13
('Helena', 'Maria', 'Andersson', 'helena.andersson@yahoo.com', '+46 8 444 55 66'),--Business customer 14
('Magnus', 'Anders', 'Persson', 'magnus.persson@gmail.com', '+46 70 987 65 43') --15

('Private'),
('Business')

INSERT INTO Account
Values
(1, 1, '2016-09-22', '2023-11-26 15:25:44', default), --1 --Privat Customer har PrivatAccount
(3,2, '2022-04-21', '2023-12-20 13:55:03', default), --2--BusinessCustomer har BusinessAccount
(5,2, '2021-12-01', '2022-01-12 16:09:25', 'Not Active'), --3--
(7,1,'2023-05-10', '2023-09-29 11:42:47', default), --4-PrivatCust/Acc
(8,2, '2022-01-27', '2023-03-02 18:23:22', default), --5
(10,2, '2018-11-12', '2021-04-30 15:01:00', 'Not Active'), --6
(11,1, '2020-06-02', '2023-07-05 10:59:46', default), --7-PrivatCust/Acc
(13,2, '2021-09-26', '2022-05-28 22:21:11', default), --8
(14,2, '2023-01-22', '2023-08-22 19:23:19', default), --9
(2,1, '2022-06-20', '2023-12-21 13:55:03', default),
(4,1, '2021-07-13', '2022-01-16 16:09:25', default),
(6,1,'2023-05-10', '2023-09-25 11:42:47', default),
(9,1, '2022-05-18', '2023-02-12 18:23:22', default),
(12,1, '2018-11-23', '2021-04-23 15:01:00', default),
(15,1, '2020-06-02', '2023-07-25 10:59:46', default)

INSERT INTO AccountDetails
Values
(1, 'AndraEva62', 'kluTTen2016<3'),
(2, 'StekpAnna', 'Kso983KQQj092'),
(3, 'onlineShopper39', 'kesoOnlineShopparen299'),
(4, 'SofiaBerg', 'BergSofiaBirgitta'),
(5, 'persSon20', '89JJosl2'),
(6, 'MåsBajs1337', 'ingenGillarMig20!'),
(7, 'svenssonElin', 'HHdd92&23Ee'),
(8, 'GoogleJohan', 'säkerLössenordFörGOOGLE992'),
(9, 'HelaMaria', '#kcjJJoepQ102OPsa')

values
('Card'),
('Invoice'),
('Swish'),
('Klarna')
```

**Orders, Order Lines & Invoices**

```
INSERT INTO [Order]
Values
(15, 1,  '2024-01-24'),     --1
(11, 3, '2024-01-24'),   --2
(2, 4, '2024-01-25'),       --3
(12, 2, '2024-01-25'),     --4     --Invoice
(7, 1, '2024-01-27'),        --5
(9, 1, '2024-01-27'),      --6
(3, 2, '2024-01-28'),       --7     --Invoice   --Business --5456,25 utan moms
(6, 3, '2024-01-28'),        --8
(4, 4, '2024-01-29'),      --9
(1, 1, '2024-01-29')        --10

INSERT INTO ProductOrder
Values
(3, 1, 1),
(41, 1, 1),
(16, 2, 1),
(34, 3, 2),
(63, 3, 1),
(9, 4, 1),
(10, 4, 1),
(26, 4, 1),
(48, 4, 1),
(53, 5, 1),
(6, 6, 1),
(11, 6, 2),
(11, 7, 1),--5235 utan moms om vi ska ta bort de
(28, 7, 1),
(35, 8, 1),
(59, 9, 1),
(20, 9, 1),
(34, 10, 1),
(66, 10, 1)

INSERT INTO Invoice (OrderID, BillingStatus, DateIssued, DueDate)
VALUES
--1 betyder att faktura är betalad
--0 betyder att faktura är ej betalad
(4, 1, '2024-01-25', '2024-02-25'),
(7, 0, '2024-01-28', '2024-02-28')
```

### 3. Dimensional Model: Star / Snowflake Schema

```
CREATE DATABASE NetOnNetStar
go
use NetOnNetStar
go

CREATE TABLE CustomerDim
(
CustomerID  int PRIMARY KEY,
Name        NVARCHAR(20),
LastName    NVARCHAR(20),
Mail       NVARCHAR(50),
Phone       NVARCHAR(20)
)

INSERT INTO CustomerDim
(
CustomerID,
Name,
LastName,
Mail,
Phone
)

SELECT
CustomerID,
Name,
LastName,
Mail,
Phone
FROM
NetOnNet.dbo.Customer

(
DateID          int PRIMARY KEY identity (1,1),
[Date]          date,
[Week]            int,
[Month]           NVARCHAR(20),
[Quarter]         int,
[Year]            int
)

INSERT INTO DateDim
(
[Date],
[Week],
[Month],
[Quarter],
[Year]
)

SELECT DISTINCT
OrderDate,
DATEPART(WEEK, OrderDate),
MONTH(OrderDate),
DATEPART(QUARTER, OrderDate),
YEAR(OrderDate)
FROM NetOnNet.dbo.[Order]

CREATE TABLE ProductDim
(
ProductID int PRIMARY KEY,
ProductName nvarchar(50),
Brand nvarchar(50),
SubCategoryName nvarchar (50),
CategoryName nvarchar (50),
SalesPrice float
)

INSERT INTO ProductDim
(
ProductID,
ProductName,
Brand,
SubCategoryName,
CategoryName,
SalesPrice
)

SELECT
ProductID,
ProductName,
Brand,
SubCategoryName,
CategoryName,
SalesPrice

FROM NetOnNET.dbo.Product p

JOIN
NetOnNet.dbo.SubCategory sc ON p.SubCategoryID = sc.SubCategoryID
JOIN
NetOnNet.dbo.Category c ON sc.CategoryID = c.CategoryID

Create table ImageDim
(ImageDimID int identity (1,1) primary key,
ProductID INT FOREIGN KEY REFERENCES ProductDim(ProductID),
ImageID int,
ImageLink nvarchar (200)
)

INSERT INTO ImageDim(
ProductID,
ImageID,
ImageLink
)

SELECT
ProductID,
ImageID,
ImageLink
FROM NetOnNET.dbo.Image

CREATE TABLE OrderDim
(
OrderID int  PRIMARY KEY,
PaymentType nvarchar(30) not null,
Date DATE
)

INSERT INTO OrderDim
(
OrderID,
PaymentType,
Date
)

SELECT
o.OrderID,
pt.PaymentType,
OrderDate
FROM
NetOnNet.dbo.[Order] o
JOIN
NetOnNet.dbo.PaymentType pt ON o.PaymentTypeID = pt.PaymentTypeID

CREATE TABLE OrderFact
(
OrderFactID     int PRIMARY KEY IDENTITY (1,1),
OrderID         int FOREIGN KEY REFERENCES OrderDim(OrderID),
ProductID		int FOREIGN KEY REFERENCES ProductDim(ProductID),
CustomerID      int FOREIGN KEY REFERENCES CustomerDim(CustomerID),
DateID          int FOREIGN KEY REFERENCES DateDim(DateID),
NumberOfOrders  int
)

INSERT INTO OrderFact (OrderID, ProductID, CustomerID, DateID, NumberOfOrders)
SELECT
o.OrderID,
p.ProductID,
c.CustomerID,
d.DateID,
COUNT(o.OrderID) AS NumberOfOrders
FROM
NetOnNet.dbo.[Order] o
JOIN
NetOnNet.dbo.ProductOrder po ON o.OrderID = po.OrderID
JOIN
NetOnNet.dbo.Product p ON po.ProductID = p.ProductID
JOIN
NetOnNet.dbo.Customer c ON o.CustomerID = c.CustomerID
JOIN
DateDim d ON o.[OrderDate] = d.[Date]
GROUP BY
o.OrderID, p.ProductID, c.CustomerID, d.DateID;
```
