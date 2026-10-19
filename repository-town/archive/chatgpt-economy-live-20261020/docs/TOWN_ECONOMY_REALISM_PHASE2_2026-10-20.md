# Repository Town: economy realism, stage 2
Date: 20 October 2026

## Scope of this implementation

This extends the finite-wallet economy introduced on 19 October 2026.
Every figure is a **fictional Town Dollar** for an accelerated day-night game,
not an Australian legal financial rate. It is a local single-player simulation;
the saved data can be manipulated using browser developer tools.

| System | New working rule | Source |
| --- | --- | --- |
| Household budget | $8 town rent and $2 power per town day; unpaid bills accrue, don't overdraft | `world/finance.js` |
| Food and energy | Player's energy drops 17 points each day; eating **owned, purchased** food restores energy and consumes the item; very low energy prevents commencing a shift | `world/finance.js`, `world/money.js` |
| NPC household bills | Each NPC owes $5 per day from their finite wallet; unpaid amounts become housing arrears | `world/finance.js` |
| Shops and farms | Private businesses pay $2 local rates and $3 utilities daily; costs debit real till/operating funds and go to council; unpaid invoices accumulate | `world/finance.js` |
| Income tax | Simplified 10% whole-dollar PAYG withholding on NPC/player wages; paid into a finite Commonwealth treasury, not council | `world/life.js`, `world/money.js` |
| Wage arrears | Unpaid NPC wages persist; when there is enough funding at later payroll, arrears can be cleared | `world/life.js` |
| Government tiers | Commonwealth receives PAYG income tax from wages; NSW state budget funds clinic/school payroll; council receives local rates, utilities, rent and weekly finite Commonwealth/NSW grants and pays local municipal payroll | `world/finance.js`, `world/life.js` |
| Bank lending | Community credit union starts with $5,000 of **already issued** lending capital. Borrow $100/$200/$400 only after working a job, with no housing arrears, enough lending capital, and no outstanding loan | `world/finance.js` |
| Interest | 8% fictional annual simple accrual on outstanding principal (tracked in cents); loan term 30 town days, overdue status; repayments transfer actual everyday-account money to bank capital | `world/finance.js` |
| Bank transaction journal | Double-sided payer/payee entries for shop sales, NPC grocery purchases, wholesale payments, payroll, bank transfers, rent, bills, taxes, loan issue and repayment; bounded history | `world/finance.js` and supporting modules |
| Businesses | Funds, gross sales, wholesale costs, payroll costs, daily/lifetime utilities/rates, unpaid bills, and operating result shown per business | `ui/economy-panels.js` |
| UI | Wallet displays energy/food and rent arrears; Town Hall teller exposes credit applications and repayment; Town Ledger links to town-wide balance, council and business breakdown | `ui/economy-panels.js`, `ui/townpanels.js` |
| Persistence | Saves accounts, bank capital, loan due status, recorded finances, food energy, NPC household arrears and business expense ledgers with backward compatibility | `world/life.js`, `world/finance.js` |

## Accounting invariant

**Every monetary transfer must debit one finite balance and credit another.**
Track the money supply as:

```
player cash + player everyday + player savings
+ all NPC wallets
+ all business operating funds + all cash registers
+ local council treasury + NSW state treasury + Commonwealth treasury + bank lending capital
```

Deposited funds are backed by the player-owned deposit vault; they must not be
counted twice in monetary supply. Loans do **not** mint deposits: they redistribute
the bank's pre-existing $5,000 equity into a borrower's account. Repayments
and interest move borrower money back to bank equity. A loan is also a
financial liability of the borrower; the bank's loan asset does not count as
spendable cash. No overdrafts are permitted.

All transfer amounts are positive integers; fractional bank interest is held as
cents accrued but only posted when paid as whole Town Dollars. The accounting
journal has matching debit/credit account labels on every new entry. Historical
entries from earlier saves are not retroactively reconstructed.

Regression commands:

```sh
node tests/economy.mjs
node tests/economy-realism.mjs
```

GitHub Actions: `.github/workflows/town-economy.yml`.
Tests cover spending, deposits, jobs, fraud/duplicate claims, conservation,
local taxation, utilities, unpaid bills, NPC payroll, bank loans/interest,
loan repayment and restoration of old saves.

## Boundaries: not fully realistic yet

1. The "Community Bank" is a **fully backed fictional community credit union** and not a genuine Australian bank. It does not have depositors besides the player, central-bank settlement, deposit insurance, regulatory capital ratios, a realistic interest-rate market, collateral valuation, foreclosure or credit scoring.
2. The economic journal captures these transfer flows but is not an independent tamper-evident server-side general ledger. Real fraud prevention would require authenticated, server-authoritative accounts, transaction IDs, reconciliation and idempotency.
3. Business operating result excludes opening-stock valuation, depreciation, capital expenditure and true inventory-based cost-of-goods-sold recognition. Wholesale purchases are expensed upfront, a cash basis simplification.
4. Tax, rent and wages are deliberately fictional per-game-day amounts, not real NSW/ATO rates or legal liabilities. Commonwealth income-tax receipts and NSW school/clinic payroll have been separated from local council rates/grants, but welfare, GST, private hospitals, post-business accounting and intergovernmental grants are simplified.
5. The council's services do not yet have per-project appropriations, voted budgets or audited procurement. Existing payroll is deducted from the finite fund, but policy and civic outcomes still need linking to resource allocation.
6. Most import goods are introduced by the freight train, not bought from a fully modelled outside supplier. Genuine external trade needs a tracked counterparty and trade balance.
7. Price formation is still mostly static and there is no full supply/demand pricing curve, land market, dynamic business formation, property ownership system, insolvency court, or estate/inheritance accounting.
8. Player nutrition only affects energy and starting jobs. It does not yet simulate complete health, long-term dietary needs or sleep-linked employment performance.
9. NPC homes do not yet support variable wages, property titles, mortgages or realistic household decisions such as saving for investments.

A good next phase is **fiscal/governance realism** (which tier of government
levies each tax, budget votes, rates based on property values, council
procurement, schools, health services), followed by true external trade,
property ownership, robust production costs, business bankruptcy and a deeper
bank capital model. Never claim this first-pass stage covers those.

## Rollout rule

Do not replace an already more advanced public `main` file with a stale source
branch. Verify economy CI plus browser access to wallets, bank and shops; run
the town's existing NPC/interior navigation tests before merging.
