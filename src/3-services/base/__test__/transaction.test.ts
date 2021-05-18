import { TestContext } from "../../../0-base/__test__/context.test";
import { TestBaseEntity } from "../../../1-entities/base/__test__/base-entity.test";
import { TestBaseModel } from "../../../2-models/base/__test__/base-model.test";
import { LocalDBTransaction } from "./local-db-transaction";

test("Transaction", async () => {
  const ch = { context: new TestContext("Transaction") };

  const e1 = await LocalDBTransaction.startTx(ch, async (tx) => {
    const m = TestBaseModel.register(ch, { seq: 1 });
    m.incrementSeq();

    return {
      returns: () => m.e,
      saveModels: [m],
      statistics: ({ savedTargets }) => {
        expect(savedTargets.length).toBe(1);
        expect(savedTargets[0].inserted).toBeTruthy();
        expect(savedTargets[0].updatedPropNames).toBeUndefined();
      },
    };
  });

  expect(e1).toBeInstanceOf(TestBaseEntity);
  expect(e1.instanceMeta.isNewEntity).toBeFalsy();
  expect(e1.instanceMeta.updatedProps.size).toBe(0);

  const e2 = await LocalDBTransaction.startReadonlyTx(ch, (tx) =>
    tx.findOneOrFail(TestBaseEntity, e1.id)
  );

  expect(e2).not.toBe(e1);
  expect(e2).toBeInstanceOf(TestBaseEntity);
  expect(e2.instanceMeta.isNewEntity).toBeFalsy();
  expect(e2.instanceMeta.updatedProps.size).toBe(0);
  expect(e2.seq).toBe(2);

  const e3 = await LocalDBTransaction.startTx(ch, async (tx) => {
    const m = new TestBaseModel(ch, { e: e2, array: [] });
    m.incrementSeq();
    return {
      returns: () => m.e,
      saveModels: [m],
      statistics: ({ savedTargets }) => {
        expect(savedTargets.length).toBe(1);
        expect(savedTargets[0].inserted).toBeUndefined();
        expect(savedTargets[0].updatedPropNames?.size).toBe(1);
        expect(savedTargets[0].updatedPropNames?.has("seq")).toBeTruthy();
      },
    };
  });

  expect(e3).not.toBe(e2);
  expect(e3.instanceMeta.isNewEntity).toBeFalsy();
  expect(e3.instanceMeta.updatedProps.size).toBe(0);
  expect(e3.seq).toBe(3);

  expect(() =>
    LocalDBTransaction.startTx(ch, async (tx) => {
      throw new Error("AAA");
    })
  ).rejects.toBeDefined();
});
