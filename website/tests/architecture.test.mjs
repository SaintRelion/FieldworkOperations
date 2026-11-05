import ts from "typescript";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { test } from "node:test";

const source = new URL("../src/", import.meta.url);
const sourceRoot = source.pathname;
function sourceFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = new URL(entry.name + (entry.isDirectory() ? "/" : ""), dir);
    return entry.isDirectory()
      ? sourceFiles(path)
      : /\.tsx?$/.test(entry.name)
        ? [path]
        : [];
  });
}
const files = sourceFiles(source);

test("route pages are flat and named Page.tsx", () => {
  for (const entry of readdirSync(new URL("pages/", source), {
    withFileTypes: true,
  })) {
    assert.ok(entry.isFile() && /Page\.tsx$/.test(entry.name), entry.name);
  }
});

test("shared and page features respect their import boundaries", () => {
  for (const file of files) {
    const name = decodeURIComponent(file.pathname.slice(sourceRoot.length));
    const ast = ts.createSourceFile(
      name,
      readFileSync(file, "utf8"),
      ts.ScriptTarget.Latest,
      true,
      name.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
    );
    const imports = ast.statements
      .filter(
        (statement) =>
          ts.isImportDeclaration(statement) ||
          ts.isExportDeclaration(statement),
      )
      .map((statement) => statement.moduleSpecifier)
      .filter((specifier) => specifier && ts.isStringLiteral(specifier))
      .map((specifier) => specifier.text);
    for (const dependency of imports) {
      assert.ok(
        !/^@\/(components|hooks|lib|models|model_types|layout|repositories|to-be-library)\//.test(
          dependency,
        ),
        name + ": legacy import " + dependency,
      );
      if (name.startsWith("shared/"))
        assert.ok(
          !/^@\/(app|pages|features)\//.test(dependency),
          name + " imports " + dependency,
        );
      if (name.startsWith("features/")) {
        assert.ok(
          !/^@\/(app|pages)\//.test(dependency),
          name + " imports " + dependency,
        );
        if (dependency.startsWith("@/features/"))
          assert.equal(
            dependency.split("/")[2],
            name.split("/")[1],
            name + " imports another page feature",
          );
      }
      if (name.startsWith("pages/"))
        assert.ok(
          !dependency.includes("firebase/firestore") &&
            !dependency.endsWith("/useResource"),
          name + " owns data-access code",
        );
    }
  }
});
