import { BasicList, ListContext, ListItem, Neovim } from 'coc.nvim';
import * as fs from 'fs';
import * as path from 'path';

interface NodeModulesInfo {
  name: string;
  version: string;
  packaePath: string;
}

export default class NodeModulesList extends BasicList {
  public readonly name = 'node_modules';
  public readonly description = 'coc.nvim extensions for node_modules';

  constructor(nvim: Neovim) {
    super(nvim);

    this.addAction('open', (item) => {
      // TODO: open CocList files -folder  <25-12-22, yourname> //
      nvim.command(`CocList files -folder ${item.data.path}`);
    });
  }

  async processDir(packaePath: string): Promise<NodeModulesInfo | null> {
    try {
      const packageJson = await import(path.join(packaePath, 'package.json'));
      return {
        name: packageJson.name,
        version: packageJson.version,
        packaePath,
      };
    } catch (e) {
      /* handle error */
      console.error(e);
    }
    return null;
  }

  async loadItems(context: ListContext): Promise<ListItem[]> {
    try {
      const baseDir = path.join(context.cwd, 'node_modules');
      const dirs = fs.readdirSync(baseDir);
      const results = await Promise.all(
        dirs.reduce<Promise<NodeModulesInfo | null>[]>((results, dir) => {
          if (dir[0] == '.') {
            return results;
          } else if (dir[0] == '@') {
            const subdirs = fs.readdirSync(path.join(baseDir, dir));
            for (const subdir of subdirs) {
              results.push(this.processDir(path.join(baseDir, dir, subdir)));
            }
          } else {
            results.push(this.processDir(path.join(baseDir, dir)));
          }
          return results;
        }, [])
      );
      // filter null elements
      return results
        .filter((v) => v != null)
        .map((v) => ({
          label: `${v?.name.padEnd(40)} ${v?.version}`,
          data: {
            ...v,
          },
        }));
    } catch (e: any) {
      /* handle error */
      console.error('node_modules error', e);
    }
    return [];
  }
}
