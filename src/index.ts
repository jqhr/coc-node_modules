import { ExtensionContext, listManager, workspace } from 'coc.nvim';
import NodeModulesList from './lists';

export async function activate(context: ExtensionContext): Promise<void> {
  context.subscriptions.push(listManager.registerList(new NodeModulesList(workspace.nvim)));
}
