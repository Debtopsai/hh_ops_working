/**
 * The revenue rule, section 7 of the brief. "Read this twice."
 *
 * The manual analysis got this wrong and produced a 7% overstatement. These
 * tests exist so that the same mistake fails loudly rather than shipping.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { contractRevenue, riskAdjustedRevenue, ltv, unitEconomics } from '../src/lib/revenue.mjs';
import { parseDepositStructure, cashUpfront } from '../src/lib/deposit.mjs';
import { serialise, Decimal } from '../src/lib/money.mjs';

// The worked example from section 7, and the one real signed contract in section 9.
const WORKED_EXAMPLE = {
  weeklyPayment: '115',
  termWeeks: 156,
  deliveryAndInstall: '895',
  depositStructure: '6+6',
};

describe('Section 7, the worked example', () => {
  const r = contractRevenue(WORKED_EXAMPLE);

  test('weekly payments total is $17,940', () => assert.equal(serialise(r.weeklyPaymentsTotal), '17940.00'));
  test('delivery and install is $895', () => assert.equal(serialise(r.deliveryAndInstall), '895.00'));
  test('CONTRACT REVENUE is $18,835', () => assert.equal(serialise(r.contractRevenue), '18835.00'));

  test('rent in advance is $690 and is NOT revenue', () => {
    assert.equal(serialise(r.cashUpfront.rentInAdvance), '690.00');
    assert.equal(r.cashUpfront.isRevenue, false);
  });

  test('security bond is $690 and is NOT revenue', () => {
    assert.equal(serialise(r.cashUpfront.securityBond), '690.00');
    assert.equal(r.cashUpfront.isRevenue, false);
  });

  test('cash upfront totals $1,380 and sits outside revenue', () => {
    assert.equal(serialise(r.cashUpfront.total), '1380.00');
    // The figure is available, and it is not inside contractRevenue.
    assert.equal(serialise(r.contractRevenue), '18835.00');
  });
});

describe('THE MISTAKE: $20,215 must never be produced', () => {
  const r = contractRevenue(WORKED_EXAMPLE);

  test('contract revenue is not $20,215', () => {
    assert.notEqual(serialise(r.contractRevenue), '20215.00');
  });

  test('the wrong figure is exactly revenue plus deposit, which is what makes it tempting', () => {
    const wrong = r.contractRevenue.plus(r.cashUpfront.total);
    assert.equal(serialise(wrong), '20215.00');
    // Proving the trap is real, and that we did not fall into it.
    assert.notEqual(serialise(r.contractRevenue), serialise(wrong));
  });

  test('the error would be a 7% overstatement', () => {
    const wrong = r.contractRevenue.plus(r.cashUpfront.total);
    const overstatement = wrong.div(r.contractRevenue).minus(1).times(100);
    assert.equal(serialise(overstatement, 1), '7.3');
  });

  test('the double count is six weeks of rent, already inside the 156', () => {
    // The advance is weeks 1 to 6 of the same 156 weeks, not extra weeks.
    const sixWeeks = new Decimal('115').times(6);
    assert.equal(serialise(sixWeeks), '690.00');
    assert.equal(serialise(r.cashUpfront.rentInAdvance), serialise(sixWeeks));
    const impliedWeeks = r.weeklyPaymentsTotal.div(r.weeklyPayment);
    assert.equal(impliedWeeks.toNumber(), 156, 'the term is 156 weeks, not 162');
  });
});

describe('The rule holds for every deposit structure', () => {
  // "Always the same rule: advance is prepayment, security is a bond, neither
  // is incremental revenue." So contract revenue must be INVARIANT to the
  // deposit structure. This is the cleanest statement of the rule there is.
  const structures = ['10+10', '8+8', '6+6', '4+4', '4+3'];

  for (const structure of structures) {
    test(`${structure}: contract revenue is still $18,835`, () => {
      const r = contractRevenue({ ...WORKED_EXAMPLE, depositStructure: structure });
      assert.equal(serialise(r.contractRevenue), '18835.00');
    });
  }

  test('but cash upfront does vary with the structure', () => {
    const tenTen = contractRevenue({ ...WORKED_EXAMPLE, depositStructure: '10+10' });
    const fourThree = contractRevenue({ ...WORKED_EXAMPLE, depositStructure: '4+3' });
    assert.equal(serialise(tenTen.cashUpfront.total), '2300.00');   // 20 x 115
    assert.equal(serialise(fourThree.cashUpfront.total), '805.00');  // 7 x 115
    assert.notEqual(serialise(tenTen.cashUpfront.total), serialise(fourThree.cashUpfront.total));
  });

  test('an unrecognised but well formed structure is flagged, not rejected', () => {
    const r = contractRevenue({ ...WORKED_EXAMPLE, depositStructure: '12+12' });
    assert.equal(serialise(r.contractRevenue), '18835.00');
    assert.equal(r.cashUpfront.recognised, false);
  });

  test('an unparseable structure yields no cash figure rather than a guess', () => {
    assert.equal(parseDepositStructure('standard'), null);
    assert.equal(parseDepositStructure(''), null);
    assert.equal(cashUpfront('nonsense', 115), null);
  });
});

describe('Terms are read from the deal, never assumed', () => {
  test('Rent, 52 weeks', () => {
    const r = contractRevenue({ weeklyPayment: '115', termWeeks: 52, deliveryAndInstall: '895' });
    assert.equal(serialise(r.contractRevenue), '6875.00'); // 52 x 115 + 895
  });
  test('Lease to Own, 156 weeks', () => {
    const r = contractRevenue({ weeklyPayment: '115', termWeeks: 156, deliveryAndInstall: '895' });
    assert.equal(serialise(r.contractRevenue), '18835.00');
  });
  test('a missing term gives null, not a default', () => {
    assert.equal(contractRevenue({ weeklyPayment: '115', termWeeks: null }), null);
    assert.equal(contractRevenue({ weeklyPayment: '115', termWeeks: 0 }), null);
  });
  test('a missing weekly payment gives null', () => {
    assert.equal(contractRevenue({ weeklyPayment: null, termWeeks: 156 }), null);
  });
});

describe('Section 9, unit economics baselines', () => {
  const r = contractRevenue(WORKED_EXAMPLE);
  const econ = unitEconomics({
    spend: '656.01',
    contractsFunded: 0,
    contractsSigned: 1,
    fundingDataAvailable: false, // GoCardless is phase 2
    revenueResult: r,
    grossMargin: '0.25',
    failureRate: '0.105',
    marginConfirmed: false,
  });

  test('contract revenue NZ$18,835 ex GST', () => assert.equal(serialise(econ.contractRevenue), '18835.00'));
  test('CAC, media only, is NZ$656.01', () => assert.equal(serialise(econ.cac), '656.01'));
  test('LTV at 25% margin is $4,708.75', () => assert.equal(serialise(econ.ltv), '4708.75'));
  test('LTV:CAC at 25% margin is 7.2 : 1', () => assert.equal(serialise(econ.ltvCac, 1), '7.2'));
  test('payback is 22.8 weeks of contribution', () => assert.equal(serialise(econ.paybackWeeks, 1), '22.8'));

  test('CAC falls back to signed and says so, because funding is unconfirmed', () => {
    assert.equal(econ.cacBasis, 'signed, funding unconfirmed');
    assert.equal(econ.contractsFunded, null);
    assert.match(econ.cacLabel, /funding data is unavailable/);
  });

  test('the margin is carried as unconfirmed', () => {
    assert.equal(econ.marginConfirmed, false);
  });

  test('the media only caveat travels with the numbers', () => {
    assert.match(econ.caveat, /Sales time, credit assessment fees and equipment cost are not included/);
  });
});

describe('Risk adjusted revenue', () => {
  const r = contractRevenue(WORKED_EXAMPLE);

  test('portfolio rate 10.5% discounts only the weekly stream', () => {
    const risk = riskAdjustedRevenue(r, '0.105');
    // 17,940 x 0.895 = 16,056.30, plus 895 install undiscounted
    assert.equal(serialise(risk.survivingWeeklyStream), '16056.30');
    assert.equal(serialise(risk.riskAdjustedRevenue), '16951.30');
  });

  test('excluding chronic accounts, 3.7%', () => {
    const risk = riskAdjustedRevenue(r, '0.037');
    assert.equal(serialise(risk.riskAdjustedRevenue), '18171.22'); // 17,940 x 0.963 + 895
  });

  test('delivery and install is never discounted', () => {
    const risk = riskAdjustedRevenue(r, '0.105');
    assert.equal(serialise(risk.deliveryAndInstall), '895.00');
  });

  test('a zero failure rate returns the unadjusted figure', () => {
    assert.equal(serialise(riskAdjustedRevenue(r, '0').riskAdjustedRevenue), '18835.00');
  });
});

describe('Margin is a sensitivity range until confirmed', () => {
  const r = contractRevenue(WORKED_EXAMPLE);
  for (const [margin, expected] of [['0.20', '5.7'], ['0.25', '7.2'], ['0.30', '8.6']]) {
    test(`at ${Number(margin) * 100}% margin, LTV:CAC is ${expected} : 1`, () => {
      const econ = unitEconomics({
        spend: '656.01', contractsFunded: 0, contractsSigned: 1, fundingDataAvailable: false,
        revenueResult: r, grossMargin: margin, failureRate: '0.105',
      });
      assert.equal(serialise(econ.ltvCac, 1), expected);
    });
  }

  test('an out of range margin gives null rather than nonsense', () => {
    assert.equal(ltv(r, '0'), null);
    assert.equal(ltv(r, '1.5'), null);
  });
});

describe('No floats anywhere in the money path', () => {
  test('a long term repeated multiply stays exact', () => {
    // 0.1 + 0.2 !== 0.3 in binary floating point. Decimal must not drift.
    const r = contractRevenue({ weeklyPayment: '0.1', termWeeks: 3, deliveryAndInstall: '0' });
    assert.equal(r.contractRevenue.toString(), '0.3');
  });

  test('a realistic contract at an awkward weekly rate stays exact', () => {
    const r = contractRevenue({ weeklyPayment: '115.35', termWeeks: 156, deliveryAndInstall: '895.45' });
    assert.equal(r.contractRevenue.toString(), '18890.05'); // 17,994.60 + 895.45
  });
});
