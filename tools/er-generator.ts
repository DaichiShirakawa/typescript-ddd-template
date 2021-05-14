import fs from "fs";
import { join } from "path";
import { Direction, Flags, Format, TypeormUml } from "typeorm-uml";

const configPath = join(__dirname, "../ormconfig.js");

const flags: Flags = {
  direction: Direction.TB,
  format: Format.PUML,
};

setTimeout(async () => {
  const typeormUml = new TypeormUml();
  let [plantuml] = await Promise.all([
    typeormUml.build(configPath, {
      ...flags,
    }),
  ]);

  fs.writeFileSync(
    join(__dirname, `../documents/er-diagram.md`),
    `/* cSpell:disable */

## ER Diagram
\`\`\`plantuml
${plantuml}
\`\`\`
`
  );
});
