import fs from "fs";

export class DDDLayerValidator {
  static scan(parent: string) {
    console.log(`Scan: ${parent}`);
    const { files, directories } = DDDLayerValidator.listChildren(parent);

    for (const file of files) {
      DDDLayerValidator.validate(file);
    }

    for (const directory of directories) {
      DDDLayerValidator.scan(directory);
    }
  }

  static validate(file: string) {
    console.log(`File: ${file}`);
    const content = fs.readFileSync(file).toString();
    const importPaths: any[] = (content.match(/(import|from) ".*";/g) || []) // ['from "../1-entities/base/base-entity"', ...]
      .map((e) => e.match(/".*"/)![0]); // ["../1-entities/base/base-entity", ...]

    const imports: Level[] = importPaths.map(DDDLayerValidator.pathToLevel);

    console.log(imports);
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
          child: parts[i + 1],
          filename: parts[parts.length - 1],
        };
      }
    }

    return {
      path: parts.join("/"),
      level: -1,
      levelName: "",
      child: "",
      filename: parts[parts.length - 1],
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

type Level = {
  path: string;
  level: number;
  levelName: string;
  child: string;
  filename: string;
};

DDDLayerValidator.scan("src");
