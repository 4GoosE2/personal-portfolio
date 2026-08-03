---
title: "Bank: Relational Database Design for a Multi-Service Banking Platform"
category: Data Analytics & BI
subcategory: Relational Database Design & Normalization
track: Educational Projects
source: Nackademin
context: Database Design and Modeling
tags:
  - ERD
  - Normalization
  - T-SQL
  - Data Modeling
  - Individual Project
date: 20 January 2024
note: >-
  About this project


  An individual database design project for my Database Design and Modeling course at Nackademin: designing a relational schema for a fictional multi-service bank from scratch, covering everyday banking, cards, loans and debt tracking, investment holdings (stocks and funds), and ATM infrastructure.


  I deliberately went beyond the assignment's scope, adding stock/fund holdings and ATM tracking on top of the core banking requirements, as a way to push myself further on cardinality decisions and normalization while keeping everything compliant with 1NF, 2NF, and 3NF. A few decisions stand out: personal data (SSN, date of birth) is split into its own access-controlled table separate from the main customer record; card-to-account cardinality went through several revisions before landing on a strict one-to-one once the actual business rule was confirmed; and ATM activity is tracked independently of the transaction log, since other banks' customers can use the same machines.
metrics:
  - label: ERD
    value: 20 Tables Across Customer, Account, Card, Loan/Debt, Stock/Fund, and ATM's
  - label: Final Course Grade
    value: G
cover: /uploads/_mconverter.eu_bank-erd-mårten-wikman.png
---
**About this project**

An individual database design project for my Database Design and Modeling course at Nackademin: designing a relational schema for a fictional multi-service bank from scratch, covering everyday banking, cards, loans and debt tracking, investment holdings (stocks and funds), and ATM infrastructure.

The goal from the start was to build something more ambitious than the assignment strictly required. Beyond the core banking tables, I deliberately went outside the brief to add stock and fund holdings and ATM tracking, as a way to push myself further with cardinality decisions and normalization, while making sure everything still held up to 1NF, 2NF, and 3NF.

**Design Decisions**

**Customer and sensitive data separation.** The core `Customer` table holds only basic identity fields; personal information (SSN, date of birth, gender) is split into its own `PersonalInfo` table with a one-to-one relationship, specifically so that sensitive data can be locked down and access-controlled separately from the rest of a customer's record. `ContactInfo` was originally embedded directly in `Customer`, but after realizing that a customer can register multiple addresses, the relationship was restructured to one-to-(one-or-many). This also avoids duplicating name and phone number data every time an address is added, and sidesteps the awkwardness of a single customer having two different ID numbers if address data had stayed in the main table. The relationship from `Customer` to the `Dispositions` bridge table is one-to-optional-many, allowing the schema to track customers who haven't yet signed up for any service (e.g., someone who's only had an advisory meeting).

**Cards.** All card data (number, expiry, CVV, PIN) lives in a single table rather than splitting sensitive fields into a separate one, on the reasoning that every field in that table is equally sensitive, so the whole table gets locked down rather than just part of it. `CardType` was split out separately to keep the design normalized and make adding new card types easy. The card-to-account cardinality went through several revisions: starting at one-to-optional-many, then one-to-(one-or-many) once it was clear a card must belong to at least one account, and finally settling on strict one-to-one once the actual business rule was confirmed, on this bank, a card connects to exactly one account.

**Debt.** `Debt` tracks missed fees or missed loan interest payments, with a one-to-(one-or-many) relationship since loans and accounts can be shared between customers at this bank. `debtType` is kept as a plain field directly on the table rather than normalized into a separate lookup, a deliberate exception, since customers can reach individually negotiated agreements, debt types are more free-form than a fixed category list would allow.

**Loans.** `Loan` holds the core amount, issue date, and a boolean for whether the interest rate is locked. Interest rate is tracked in a separate `LoanInterestRate` table (percentage plus the date it took effect) rather than as a single field on `Loan`, specifically to preserve a history of rate changes over time rather than only the current rate.

**Accounts.** `Account` is one of the largest tables, holding account details plus booleans for whether a card is connected and for soft-delete (`accountActive`) rather than hard deletion. `AccountType` is split into its own foreign-keyed table. Stock and fund holdings both connect to `Account` through bridge tables (`AccountStock`, `AccountFund`) since an account can hold several stocks or funds and vice versa, a genuine many-to-many needing a bridge rather than a direct link. `Stock` and `Fund` are structurally almost identical, sharing the same price-history pattern (`StockPrice`/`FundPrice`, each storing a price and the date it applied), the one structural difference is that `Fund` also stores a `fundManager` field.

**Transactions.** `Transaction` includes amount, date, a boolean marking whether the transaction was a cash withdrawal, running balance, and a free-text description field covering things like a Swish recipient number, a transferred-to account, or a merchant name. `TransactionType` is a separate foreign-keyed lookup to constrain what transaction types can exist and reduce inconsistent data entry. `atmId` links to `ATM` (street, street number, city, province), which in turn connects to its own `ATMActivity` table (date, cash balance, amount withdrawn, amount deposited). ATM activity was deliberately kept in its own table rather than folded into `Transaction`, since customers from other banks can also use these ATMs, so cash-refill history and scheduling needed to be tracked independently of any single bank's own transaction log.



### Database & Table Creation

```
CREATE DATABASE Bank
GO
--Databas

USE Bank
CREATE TABLE Customer
(
customerId int PRIMARY KEY IDENTITY (1,1),
customerActive bit NOT NULL,
customerFirstName nvarchar(50) NOT NULL,
customerMiddleName nvarchar(50),
customerLastName nvarchar(50) NOT NULL,
phoneNumber nvarchar(15) NOT NULL
)

USE Bank
CREATE TABLE PersonalInfo
(
customerPersonalInfoId int PRIMARY KEY IDENTITY (1,1),
socialSecurityNumber nvarchar(20) NOT NULL,
dateOfBirth date NOT NULL,
gender nvarchar(10) NOT NULL,
customerId int FOREIGN KEY REFERENCES Customer(customerid) NOT NULL
)

USE Bank
CREATE TABLE ContactInfo
(
customerContactInfoId int PRIMARY KEY IDENTITY (1,1),
customerAdress nvarchar(50) NOT NULL,
city nvarchar(50) NOT NULL,
postalCode nvarchar(20) NOT NULL,
province nvarchar(50) NOT NULL,
customerId int FOREIGN KEY REFERENCES Customer(customerid) NOT NULL
)

USE Bank
CREATE TABLE AccountType
(
accountTypeId int PRIMARY KEY IDENTITY (1,1),
accountType nvarchar(50) NOT NULL
)

USE Bank
CREATE TABLE Account
(
accountId int PRIMARY KEY IDENTITY(1,1),
accountNumber nvarchar(14) NOT NULL,
clearingNumber nvarchar(6) NOT NULL,
accountActive bit NOT NULL,
cardConnected bit NOT NULL,
accountTypeId int FOREIGN KEY REFERENCES AccountType(accountTypeId) NOT NULL
)

USE Bank
CREATE TABLE Fund
(
fundId int PRIMARY KEY IDENTITY (1,1),
fundName nvarchar(30) NOT NULL,
fundManager nvarchar(30) NOT NULL
)

USE Bank
CREATE TABLE FundPrice
(
fundPriceId int PRIMARY KEY IDENTITY (1,1),
fundPrice float NOT NULL,
fundDate date NOT NULL,
fundId int FOREIGN KEY REFERENCES Fund(fundId) NOT NULL
)

USE Bank
CREATE TABLE AccountFund
(
accountFundId int PRIMARY KEY IDENTITY (1,1),
fundId int FOREIGN KEY REFERENCES Fund(fundId) NOT NULL,
accountId int FOREIGN KEY REFERENCES Account(accountId) NOT NULL
)

USE Bank
CREATE TABLE Stock
(
stockId int PRIMARY KEY IDENTITY (1,1),
stockName nvarchar(30) NOT NULL,
)

USE Bank
CREATE TABLE StockPrice
(
stockPriceId int PRIMARY KEY IDENTITY (1,1),
stockPrice float NOT NULL,
stockDate date NOT NULL,
stockId int FOREIGN KEY REFERENCES Stock(stockId) NOT NULL
)

USE Bank
CREATE TABLE AccountStock
(
accountStockId int PRIMARY KEY IDENTITY (1,1),
stockId int FOREIGN KEY REFERENCES stock(stockId) NOT NULL,
accountId int FOREIGN KEY REFERENCES Account(accountId) NOT NULL
)

USE Bank
CREATE TABLE CardType
(
cardTypeId int PRIMARY KEY IDENTITY (1,1),
cardType nvarchar(20) NOT NULL
)

USE Bank
CREATE TABLE [Card]
(
cardId int PRIMARY KEY IDENTITY(1,1),
cardNumber nvarchar(50) NOT NULL,
cardExpireDate date NOT NULL,
cardCVV nvarchar(3) NOT NULL,
issueDate date NOT NULL,
pinCode nvarchar(4) NOT NULL,
cardTypeId int FOREIGN KEY REFERENCES CardType(cardTypeId) NOT NULL
)

USE Bank
CREATE TABLE Debt
(
debtId int PRIMARY KEY IDENTITY (1,1),
debtType nvarchar(50) NOT NULL,
debtAmount float NOT NULL,
debtStartDate date NOT NULL,
debtDueDate date NOT NULL,
)

USE Bank
CREATE TABLE Loan
(
loanId int PRIMARY KEY IDENTITY(1,1),
loanAmount float NOT NULL,
loanIssueDate date NOT NULL,
loanIntrestRateLocked bit NOT NULL,
)

USE Bank
CREATE TABLE LoanIntrestRate
(
loanIntrestRateId int PRIMARY KEY IDENTITY(1,1),
intrestRatePercent float NOT NULL,
intrestDate date NOT NULL,
loanId int FOREIGN KEY REFERENCES Loan(loanId) NOT NULL
)

USE Bank
CREATE TABLE TransactionType
(
transactionTypeId int PRIMARY KEY IDENTITY(1,1),
transactionType nvarchar(30) NOT NULL
)

USE Bank
CREATE TABLE ATM
(
atmId int PRIMARY KEY IDENTITY(1,1),
atmStreet nvarchar(50) NOT NULL,
atmStreetNumber nvarchar(5) NOT NULL,
atmCity nvarchar(50) NOT NULL,
atmProvince nvarchar(50) NOT NULL
)

USE Bank
CREATE TABLE ATMActivity
(
atmBalanceId int PRIMARY KEY IDENTITY(1,1),
atmDate date NOT NULL,
atmBalance float,
atmWithdrawAmount float NOT NULL,
atmDepositAmount float NOT NULL,
atmId int FOREIGN KEY REFERENCES ATM(atmID) NOT NULL
)

USE Bank
CREATE TABLE [Transaction]
(
transactionId int PRIMARY KEY IDENTITY(1,1),
transactionAmount float NOT NULL,
transactionDate date NOT NULL,
withdrawTransaction bit NOT NULL,
balance float,
[description] nvarchar(50),
trasactionTypeId int FOREIGN KEY REFERENCES TransactionType(transactionTypeId) NOT NULL,
accountId int FOREIGN KEY REFERENCES Account(accountId) NOT NULL,
atmId int FOREIGN KEY REFERENCES ATM(atmId)
)

USE Bank
CREATE TABLE Dispositions
(
cardId int FOREIGN KEY REFERENCES Card,
customerId int FOREIGN KEY REFERENCES Customer(customerId),
accountId int FOREIGN KEY REFERENCES Account(accountId),
debtId int FOREIGN KEY REFERENCES debt(debtId),
loanId int FOREIGN KEY REFERENCES Loan(loanId),
)
```

### Account Types & Accounts

```
INSERT INTO AccountType
VALUES
('Bank Konto'), --1
('Spar Konto'), --2
('Aktie Konto'), --3
('Fond Konto'), --4
('ISK Konto'), --5
('Pensions Konto'), --6
('Pensions Fond') --7

INSERT INTO Account
VALUES
('498 489 489-4', '8327-9', '1', '1', '1'), --1 KUND1
('464 946 289-4', '8327-9', '1', '0', '5'), --2 KUND1
('928 648 428-4', '8327-9', '0', '0', '2'), --3 KUND1
('238 489 129-4', '8327-9', '0', '0', '6'), --4 KUND1
('624 992 817-4', '8327-9', '1', '1', '1'), --5 KUND2
('214 872 923-4', '8327-9', '1', '0', '3'), --6 KUND2
('663 324 426-4', '8327-9', '1', '0', '2'), --7 KUND2
('931 985 198-4', '8327-9', '0', '0', '4'), --8 KUND2
('982 757 010-4', '8327-9', '1', '1', '2'), --9 KUND3
('132 098 785-4', '8327-9', '1', '0', '7'), --10 KUND3
('324 654 398-4', '8327-9', '1', '1', '1'), --11 KUND3
('994 783 187-4', '8327-9', '1', '1', '1'), --12 KUND4
('153 918 674-4', '8327-9', '1', '0', '5'), --13 KUND4
('983 877 112-4', '8327-9', '1', '0', '4'), --14 KUND4
('552 238 887-4', '8327-9', '0', '1', '1'), --15 KUND5
('773 872 589-4', '8327-9', '1', '1', '1'), --16 KUND6
('213 668 918-4', '8327-9', '1', '1', '1'), --17 KUND7
('131 889 726-4', '8327-9', '1', '1', '1'), --18 KUND8
('883 928 991-4', '8327-9', '1', '0', '7'), --19 KUND8
('918 773 019-4', '8327-9', '0', '0', '3'), --20 KUND8
('738 982 010-4', '8327-9', '1', '1', '1'), --21 KUND9
('929 999 887-4', '8327-9', '1', '0', '2'), --22 KUND9
('839 117 897-4', '8327-9', '1', '1', '1'), --23 KUND10
('098 000 238-4', '8327-9', '0', '0', '5') --24 KUND10
```

### ATMs, Transactions & Transaction Types

```
INSERT INTO ATM
VALUES
('Stenhamravägen', '1', 'Stenhamra', 'Stockholm'), --1
('Ekebyhovsvägen', '4', 'Ekerö', 'Stockholm'), --2
('Alviksvägen', '18', 'Bromma', 'Stockholm') --3

INSERT INTO TransactionType
VALUES
('Deposit'), --1
('Withdraw'), --2
('Transfer'), --3
('Swish'), --4
('Pay') --5

INSERT INTO [Transaction] --amount, date, withdrawBIT, balance, description, type, account, atm --1,5,21,16
VALUES
(-26.00, '2024-01-01 11:23:00', 0, 9096.14,'SL', 4, 1, NULL),
(600.00, '2024-01-01 11:40:00', 0, 12600.55, NULL, 1, 5, 2),
(-459.99, '2024-01-01 12:01:00', 0, 12140.56, 'Coop', 5, 21, NULL),
(-800.00, '2024-01-01 13:21:00', 1, 58990.00,'Withdraw', 2, 16, 3),
(-46.00, '2024-01-02 13:25:00', 0, 12554.14, 'Ica', 5, 1, NULL),
(-257.75, '2024-01-02 14:33:00', 0, 7738.23, 'Hunters Barber', 5, 23, NULL),
(-6000.00, '2024-01-02 16:40:00', 0, 4600.00,'883 928 991-4', 3, 18, NULL),
(6000.00, '2024-01-02 16:40:00', 0, 346785.46, NULL, 1, 19, NULL),
(1500.50, '2024-01-03 08:30:00', 0, 2500.75, NULL, 1, 11, 1),
(-300.25, '2024-01-03 12:45:00', 1, 2200.50, NULL, 2, 22, 2),
(1000.00, '2024-01-03 13:15:00', 0, 3200.75, 'Swish from 828 787 48 87', 1, 16, NULL),
(-500.75, '2024-01-04 14:20:00', 1, 453934.00, NULL, 2, 7, NULL),
(500.75, '2024-01-04 14:20:00', 0, 8238.23, NULL, 1, 5, NULL),
(-200.50, '2024-01-05 09:00:00', 0, 58790.00, 'Coop', 5, 16, NULL),
(-75.00, '2024-01-05 11:30:00', 1, 4525.00, 'Apoteket', 2, 18, NULL),
(-120.00, '2024-01-05 13:15:00', 0, 2945.50, ' 7897-9 465 468 879-9', 3, 7, NULL),
(800.00, '2024-01-05 10:45:00', 0, 3745.50, NULL, 1, 17, 2),
(-450.25, '2024-01-05 16:00:00', 1, 23895.76, 'Ica', 5, 9, NULL),
(-600.00, '2024-01-06 14:10:00', 0, 23295.76, 'Systembolaget', 3, 9, NULL),
(-300.00, '2024-01-07 08:30:00', 0, 3595.25, NULL, 1, 11, NULL),
(-200.50, '2024-01-07 12:45:00', 0, 3394.75, 'Swish', 4, 12, NULL),
(1500.75, '2024-01-08 10:15:00', 0, 4895.50, NULL, 1, 13, NULL)

INSERT INTO ATMActivity
VALUES
('2024-01-01', '98000', '-800', '8000', '3'),
('2024-01-03', '33000', '-7000', '3000', '1'),
('2024-01-03', '60000', '-6000', '9000', '2'),
('2024-01-05', '114000', '-8000', '24000', '2')
```

### Stocks & Funds

```
INSERT INTO Stock
VALUES
('Apple'), --1
('Amazon'), --2
('Ericsson'), --3
('Meta'), --4
('Tesla') --5

INSERT INTO StockPrice
VALUES
(450, '2024-01-01', 1),
(309, '2024-01-01', 2),
(51, '2024-01-01', 3),
(527, '2024-01-01', 4),
(209, '2024-01-01',5),
(454, '2024-01-02', 1),
(300, '2024-01-02', 2),
(61, '2024-01-02', 3),
(528, '2024-01-02', 4),
(212, '2024-01-02',5),
(450, '2024-01-03', 1),
(305, '2024-01-03', 2),
(57, '2024-01-03', 3),
(533, '2024-01-03', 4),
(210, '2024-01-03',5),
(452, '2024-01-04', 1),
(304, '2024-01-04', 2),
(55, '2024-01-04', 3),
(541, '2024-01-04', 4),
(216, '2024-01-04',5),
(457, '2024-01-05', 1),
(302, '2024-01-05', 2),
(59, '2024-01-05', 3),
(538, '2024-01-05', 4),
(225, '2024-01-05',5),
(461, '2024-01-06', 1),
(307, '2024-01-06', 2),
(64, '2024-01-06', 3),
(543, '2024-01-06', 4),
(220, '2024-01-06',5),
(467, '2024-01-07', 1),
(317, '2024-01-07', 2),
(66, '2024-01-07', 3),
(540, '2024-01-07', 4),
(229, '2024-01-07',5),
(470, '2024-01-08', 1),
(325, '2024-01-08', 2),
(69, '2024-01-08', 3),
(549, '2024-01-08', 4),
(240, '2024-01-08',5)

INSERT INTO AccountStock --AKTIE-- 2,6,13,24
VALUES
(1,2),
(3,2),
(2,2),
(1,6),
(5,6),
(2,6),
(1,13),
(5,24),
(4,24),
(2,24)

INSERT INTO Fund
VALUES
('Avanza Fonden', 'Avanza'), --1
('SEB Fonden', 'SEB'), --2
('RåvaroFond', 'Avanza') --3

INSERT INTO FundPrice
VALUES
(355, '2024-01-01', 1),
(190, '2024-01-01', 2),
(209, '2024-01-01', 3),
(356, '2024-01-02', 1),
(192, '2024-01-03', 2),
(211, '2024-01-03', 3),
(354, '2024-01-04', 1),
(194, '2024-01-04', 2),
(212, '2024-01-04', 3),
(356, '2024-01-05', 1),
(193, '2024-01-05', 2),
(213, '2024-01-05', 3),
(356, '2024-01-06', 1),
(195, '2024-01-06', 2),
(214, '2024-01-06', 3),
(357, '2024-01-07', 1),
(197, '2024-01-07', 2),
(215, '2024-01-07', 3),
(358, '2024-01-08', 1),
(196, '2024-01-08', 2),
(218, '2024-01-08', 3)

INSERT INTO AccountFund --FOND-- 2,8,10,13,14,19,24
VALUES
(1,2),
(1,8),
(2,8),
(3,8),
(1,10),
(3,10),
(3,13),
(2,14),
(1,19),
(3,19),
(2,24),
(3,24)
```

### Loans, Interest Rates & Debt

```
INSERT INTO Loan
VALUES
(1000000, '2015-04-30', 1),
(500000, '2019-09-04', 0)

INSERT INTO LoanIntrestRate
VALUES
(0.0523,'2015-04-30', 1),
(0.0434,'2019-09-04', 2),
(0.0534,'2020-09-04', 2),
(0.0504,'2021-09-04', 2),
(0.0594,'2022-09-04', 2),
(0.0634,'2023-09-04', 2),
(0.0794,'2024-09-04', 2)

INSERT INTO debt
VALUES
('Konto Avgift', 189.00, '2023-11-25', '2023-12-25'),
('Otillgängliga tillgångar', 25.60, '2023-12-30', '2024-01-25')
```

### Cards & Card Types

```
INSERT INTO CardType
VALUES
('Kredit Kort'),
('Bank Kort')

INSERT INTO [Card] --1,5,9,11,12,15,17,18,21,23
VALUES
('7029 1238 8921 2122', '2024-07-01', '998', '2019-07-15', '9823', 1),
('1236 7638 8817 2227', '2024-09-01', '772', '2019-09-01', '2374', 1),
('9839 8927 7167 7623', '2025-03-01', '312', '2020-03-12', '2492', 2),
('9288 8837 1128 2873', '2025-10-01', '118', '2020-10-20', '4948', 1),
('9203 2761 7263 9587', '2025-12-01', '859', '2021-12-01', '3984', 2),
('2389 9283 2731 1289', '2026-01-01', '545', '2021-01-24', '2284', 2),
('7099 1367 9873 8973', '2026-06-01', '156', '2021-06-05', '0039', 1),
('5543 2234 1222 1236', '2027-02-01', '928', '2022-02-09', '3884', 1),
('9780 1189 8980 1547', '2028-08-01', '312', '2023-08-19', '3343', 1),
('9938 8938 7728 1098', '2028-11-01', '398', '2023-11-05', '3001', 2)
```

### Customers, Personal Info & Contact Info

```
INSERT INTO Customer
VALUES
(1, 'Kalle', 'Von', 'Anka', '878 783 91 82'), --1
(1, 'Ragnar', NULL, 'Lothbrok', '878 923 19 57'), --2
(1, 'Lagetha', NULL, 'Lothbrok', '878 199 00 99'), --3
(1, 'Björn', 'Järnsida', 'Lothbrok', '878 399 01 33'), --4
(0, 'Ivar', 'Benlös', 'Lothbrok', '878 929 66 28'), --5
(1, 'Viktor', 'Hugo', 'Majdan', '878 709 17 11'), --6
(1, 'Mårten', 'Johan Gustav', 'Wikman', '878 232 99 01'), --7
(1, 'Daniel', NULL, 'Kham', '878 263 98 20'), --8
(1, 'Rasmus', 'Greven', 'Bertel','878 398 10 23'), --9
(1, 'Krystian', NULL, 'Lorkowski', '878 238 19 75') --10

INSERT INTO PersonalInfo
VALUES
('890630-4532', '1989-06-30', 'Male', 1),
('701223-9283', '1970-12-23', 'Male', 2),
('750109-1237', '1975-01-09', 'Female',3),
('880420-8721', '1988-04-20', 'Male', 4),
('901001-4788', '1990-10-01', 'Male', 5),
('020430-1235', '2002-04-30', 'Male', 6),
('720927-6173', '1972-09-27', 'Male', 7),
('841029-8932', '1984-10-29', 'Male', 8),
('780301-1293', '1978-03-01', 'Male', 9),
('990622-8893', '1922-06-22', 'Male', 10)

INSERT INTO ContactInfo
VALUES
('Söderströmsvägen 90b', 'Stenhamra', '17961', 'Stockholm', 1),
('Bilvägen 5', 'Stenhamra', '17582', 'Stockholm', 2),
('Sveavägen 4', 'Stockholm', '29938', 'Stockholm', 2),
('Uppgårsgatan 1', 'Stenhamra', '17961', 'Stockholm', 3),
('Vallhallavägen 88', 'Skå', '19827', 'Stockholm', 4),
('Karlsbacken 22', 'Ekerö', '19828', 'Stockholm', 5),
('Bmwgatan 2', 'Munsö', '17390', 'Stockholm', 6),
('Stadshuset', 'Stockholm', '23984', 'Stockholm', 6),
('Gårdsgatan 23', 'Svartsjö', '17689', 'Stockholm', 7),
('Vallviksvägen 120', 'Stenhamra', '17961', 'Stockholm', 8),
('Vetevägen 48', 'Stenhamra', '17966', 'Stockholm', 9),
('Brommaplan 8', 'Bromma', '20938', 'Stockholm', 9),
('Cancergatan 77', 'Adelsö', '17388', 'Stockholm', 10)
```
