import { normalize } from '@angular-devkit/core';
import { Rule, chain, schematic, Tree } from '@angular-devkit/schematics';

const PLAYGROUND_ROUTING_MODULE_PATH = normalize('/src/playground/playground-routing.module.ts');

/**
 * Clears the routes array in playground-routing.module.ts to prevent duplicate accumulation.
 * The file is regenerated from scratch each time.
 */
function clearPlaygroundRoutes(): Rule {
  return (tree: Tree) => {
    const content = tree.read(PLAYGROUND_ROUTING_MODULE_PATH);
    if (!content) {
      return tree;
    }

    const fileContent = content.toString();
    // Match the routes array and replace with empty array
    const routesRegex = /export const routes: Routes = \[[\s\S]*?\];/;
    const newContent = fileContent.replace(routesRegex, 'export const routes: Routes = [];');

    tree.overwrite(PLAYGROUND_ROUTING_MODULE_PATH, newContent);
    return tree;
  };
}

export function generatePlayground(): Rule {
  return chain([clearPlaygroundRoutes(), schematic('playground-module', {}), schematic('playground-components', {})]);
}
