// Town accounts: where the town's money sits (council, Commonwealth, NSW, the bank, shops, people),
// what each business earned and paid, and the recent double-entry journal (src/world/finance.js).
import { esc } from './interactions.js';

const d = (n) => '$' + Math.round(n || 0).toLocaleString('en-AU');

export function economyPanel(life, back) {
  const r = life.economyReport(), f = r.daily, t = r.lifetime;
  const biz = r.biz.map((b) => `<tr><td>${esc(b.name)}</td><td>${d(b.till)}</td><td>${d(b.sales)}</td><td>${d(b.wages)}</td><td>${d(b.rates + b.utilities)}</td><td>${d(b.result)}</td><td>${b.unpaid ? d(b.unpaid) : '–'}</td></tr>`).join('');
  const rows = r.entries.map((e) => `<tr><td>Day ${e.day}</td><td>${esc(e.memo)}</td><td>${esc(e.debit)} → ${esc(e.credit)}</td><td>${d(e.amount)}</td></tr>`).join('') || '<tr><td colspan="4">Nothing recorded yet</td></tr>';
  return {
    title: '📊 Town accounts', wide: true,
    body: `<p><b>Money in town:</b> ${d(r.total)} — all of it counted below. Money only moves between these pots; none is made from nothing.</p>
      <table class="ledger"><tr><th>Council</th><th>Commonwealth</th><th>NSW</th><th>Community bank pool</th><th>Shop tills</th><th>Villagers</th><th>You</th></tr>
      <tr><td>${d(r.council)}</td><td>${d(r.commonwealth)}</td><td>${d(r.nsw)}</td><td>${d(r.bank)}</td><td>${d(r.tills)}</td><td>${d(r.people)}</td><td>${d(r.visitor)}</td></tr></table>
      <h3>Today · lifetime</h3>
      <p>PAYG income tax to the Commonwealth: <b>${d(f.tax)}</b> · ${d(t.tax)}<br>
      NSW health and school wages: <b>${d(f.stateWages)}</b> · ${d(t.stateWages)} · council wages: <b>${d(f.councilWages)}</b> · ${d(t.councilWages)}<br>
      Business rates: <b>${d(f.rates)}</b> · ${d(t.rates)} · utilities: <b>${d(f.utilities)}</b> · ${d(t.utilities)} · household rent: <b>${d(f.rent)}</b> · ${d(t.rent)}<br>
      Grants to council: <b>${d(f.grants)}</b> · ${d(t.grants)}</p>
      <p>Owed and not yet paid: your rent ${d(r.rentArrears)} and power ${d(r.powerArrears)} · villagers' wage arrears ${d(r.wageArrears)} · villagers' rate arrears ${d(r.rateArrears)} · business bills ${d(f.unpaid)}.</p>
      <h3>Businesses</h3><table class="ledger"><tr><th>Business</th><th>Till</th><th>Sales</th><th>Wages paid</th><th>Rates + utilities</th><th>Result</th><th>Bills owed</th></tr>${biz}</table>
      <h3>Recent transfers</h3><table class="ledger"><tr><th>Day</th><th>What</th><th>From → to</th><th>Amount</th></tr>${rows}</table>
      <p class="dim">Fictional Town Dollars for a 24-minute day, not real Australian rates. Commonwealth and NSW grants last only while their treasuries do.</p>`,
    actions: back ? [{ label: 'Back', run: back }] : [],
  };
}
