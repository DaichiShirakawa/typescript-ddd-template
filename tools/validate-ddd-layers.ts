import fs from "fs";

export class DDDLayerValidator {
  static scan(parent: string): ScannedFile[] {
    console.log(`Scan: ${parent}`);
    const result: ScannedFile[] = [];
    const { files, directories } = DDDLayerValidator.listChildren(parent);

    for (const file of files) {
      result.push(DDDLayerValidator.validate(file));
    }

    for (const directory of directories) {
      result.push(...DDDLayerValidator.scan(directory));
    }

    return result;
  }

  static validate(file: string): ScannedFile {
    console.log(`File: ${file}`);
    const self = DDDLayerValidator.pathToLevel(file);
    const imports = DDDLayerValidator.importedLevelsOf(file);

    if (self.level < 0) return { self, imports };

    for (const imported of imports) {
      if (imported.level < 0) {
        // no-validation
      } else if (
        self.level === imported.level &&
        self.levelName === imported.levelName
      ) {
        if (self.dir === "base" && imported.dir !== "base") {
          imported.violations.push(
            `base/modules can import only non-base/modules`
          );
        }
      } else if (self.level <= imported.level) {
        imported.violations.push(`Imports arrow only lower-level`);
      }
      if (0 < imported.violations.length) {
        self.violations.push(imported.path);
      }
    }

    return { self, imports };
  }

  static importedLevelsOf(file: string) {
    const content = fs.readFileSync(file).toString();
    const importPaths: any[] = (content.match(/(import|from) ".*";/g) || []) // ['from "../1-entities/base/base-entity"', ...]
      .map((e) => e.match(/".*"/)![0]); // ["../1-entities/base/base-entity", ...]
    const imports: Level[] = importPaths.map(DDDLayerValidator.pathToLevel);
    return imports;
  }

  static pathToLevel(path: string): Level {
    const parts: string[] = path.match(/([A-z\d-.]+(?=[\/"]))/g) || [];
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const m = part.match(/(?<level>\d+)-(?<name>.*)/);
      if (m) {
        return {
          path,
          level: Number(m.groups!.level),
          levelName: m.groups!.name,
          dir: parts[i + 1],
          filename: parts[parts.length - 1],
          violations: [],
        };
      }
    }

    return {
      path: parts.join("/"),
      level: -1,
      levelName: "",
      dir: "",
      filename: parts[parts.length - 1],
      violations: [],
    };
  }

  static listChildren(parent: string) {
    const children = fs
      .readdirSync(parent)
      .map((child) => `${parent}/${child}`);

    const directories: string[] = [];
    const files: string[] = [];

    children.forEach((child) =>
      fs.lstatSync(child).isDirectory()
        ? directories.push(child)
        : files.push(child)
    );
    return { files, directories };
  }
}
type ScannedFile = {
  self: Level;
  imports: Level[];
};

type Level = {
  path: string;
  level: number;
  levelName: string;
  dir: string;
  filename: string;
  violations: string[];
};

const result = DDDLayerValidator.scan("src");
const violations = result.filter((e) => 0 < e.self.violations.length);

console.log(`
-----
${violations.length ? "❌" : "✅"} ${violations.length} Violations found / ${
  result.length
} files
-----
${violations
  .map(
    (e) => `- ${e.self.path}\n${e.imports
      .filter((e) => 0 < e.violations.length)
      .map((e) => `  - ${e.path}\n${e.violations.map((v) => `    - ${v}`)}`)}
`
  )
  .join("\n\n")}
`);
