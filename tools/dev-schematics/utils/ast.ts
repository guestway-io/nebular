/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import * as ts from 'typescript';
import { normalize, Path } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { addDeclarationToModule } from '@angular/cdk/schematics';
import { applyInsertChange } from './change';
import { getNodeIndentation } from './formatting';

// Custom parseSourceFile function to avoid type conflicts
function parseSourceFile(tree: Tree, path: Path): ts.SourceFile {
  const content = tree.read(path);
  if (!content) {
    throw new Error(`File ${path} not found`);
  }
  return ts.createSourceFile(
    path,
    content.toString(),
    ts.ScriptTarget.Latest,
    true
  );
}

/**
 * Returns all exported and named class declarations with a given decorator.
 */
export function getClassWithDecorator(tree: Tree, path: Path, decoratorName: string): ts.ClassDeclaration[] {
  const sourceFile = parseSourceFile(tree, path);
  const classDeclarations: ts.ClassDeclaration[] = [];
  
  function visit(node: ts.Node) {
    if (node.kind === ts.SyntaxKind.ClassDeclaration) {
      const classNode = node as ts.ClassDeclaration;
      if (classNode.name && isNodeExported(classNode) && hasDecoratorCall(classNode, decoratorName)) {
        classDeclarations.push(classNode);
      }
    }
    ts.forEachChild(node, visit);
  }
  
  visit(sourceFile);
  return classDeclarations;
}

/**
 * Partially adopted from getDecoratorMetadata from angular ast-utils.
 * https://github.com/angular
 * /angular-cli/blob/e3f56ebc71d57c79528fb4926a267e5ed4f9c74d/packages/schematics/angular/utility/ast-utils.ts#L282
 */
export function hasDecoratorCall(classDeclaration: ts.ClassDeclaration, decoratorName: string): boolean {
  const decorators = ts.canHaveDecorators(classDeclaration) ? ts.getDecorators(classDeclaration) : undefined;

  if (decorators == null) {
    return false;
  }

  return decorators
    .filter((d) => d.expression.kind === ts.SyntaxKind.CallExpression)
    .map((d) => (d.expression as ts.CallExpression).expression)
    .some((decoratorFactoryCall) => decoratorFactoryCall.getText() === decoratorName);
}

/**
 * True if node is visible outside this file, false otherwise
 * github.com/Microsoft/TypeScript-wiki/blob/d6867c43218212eff796dd971f54040234c2233a/Using-the-Compiler-API.md#L757
 * */
export function isNodeExported(node: ts.Declaration): boolean {
  return (
    (ts.getCombinedModifierFlags(node) & ts.ModifierFlags.Export) !== 0 ||
    (!!node.parent && node.parent.kind === ts.SyntaxKind.SourceFile)
  );
}

export function findDeclarationByIdentifier(source: ts.SourceFile, identifierText: string): ts.VariableDeclaration | undefined {
  let result: ts.VariableDeclaration | undefined;
  
  function visit(node: ts.Node) {
    if (node.kind === ts.SyntaxKind.VariableDeclaration) {
      const varDecl = node as ts.VariableDeclaration;
      if (varDecl.name && ts.isIdentifier(varDecl.name) && varDecl.name.getText() === identifierText) {
        result = varDecl;
        return;
      }
    }
    ts.forEachChild(node, visit);
  }
  
  visit(source);
  return result;
}

export function addObjectProperty(
  tree: Tree,
  source: ts.SourceFile,
  node: ts.ObjectLiteralExpression,
  property: string,
) {
  addNodeArrayElement(tree, source, node, property);
}

export function addArrayElement(tree: Tree, source: ts.SourceFile, node: ts.ArrayLiteralExpression, element: string) {
  addNodeArrayElement(tree, source, node, element);
}

function addNodeArrayElement(
  tree: Tree,
  source: ts.SourceFile,
  node: ts.ObjectLiteralExpression | ts.ArrayLiteralExpression,
  element: string,
): void {
  const elements = (node as ts.ObjectLiteralExpression).properties || (node as ts.ArrayLiteralExpression).elements;

  const hasElements = elements.length > 0;
  let insertPosition: number;
  let toRemove = '';
  if (hasElements) {
    const lastEl = elements[elements.length - 1];
    insertPosition = lastEl.getFullStart() + lastEl.getFullText().length;
    toRemove = source.getFullText().slice(insertPosition, node.getEnd() - 1);
  } else {
    insertPosition = elements.pos;
  }

  const prevElementTrailingComma = hasElements ? ',' : '';
  const nodeIndentation = ' '.repeat(getNodeIndentation(source.getFullText(), node));
  const elementIndentation = nodeIndentation + '  ';
  const indentedElement = elementIndentation + element.replace(/\n/gm, `\n${elementIndentation}`);
  const closingBracketIndentation = nodeIndentation;

  const toAdd = prevElementTrailingComma + '\n' + indentedElement + ',\n' + closingBracketIndentation;

  const recorder = tree.beginUpdate(source.fileName);
  if (toRemove.length) {
    recorder.remove(insertPosition, toRemove.length);
  }
  recorder.insertLeft(insertPosition, toAdd);
  tree.commitUpdate(recorder);
}

export function addDeclaration(tree: Tree, modulePath: Path, componentClass: string, importPath: string): void {
  const source = parseSourceFile(tree, modulePath);
  // Convert our SourceFile to the CDK expected type
  const cdkSource = source as any;
  const declarationsChanges = addDeclarationToModule(cdkSource, modulePath, componentClass, importPath);
  applyInsertChange(tree, normalize(source.fileName), ...declarationsChanges);
}
