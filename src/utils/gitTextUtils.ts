import { MagitChangeHunk } from '../models/magitChangeHunk';
import { Uri } from 'vscode';
import { Section } from '../views/general/sectionHeader';
import { MagitMergingState } from '../models/magitMergingState';
import * as Constants from '../common/constants';

export default class GitTextUtils {

  public static diffToHunks(diff: string, uri: Uri, section: Section): MagitChangeHunk[] {

    const hunksStart = diff.indexOf('@@');
    const diffHeader = diff.slice(0, hunksStart);

    return diff
      .replace(Constants.FinalLineBreakRegex, '') // removes extra line break at the end
      .slice(hunksStart)
      .split(/\n(?=^@@.*@@.*$)/gm)
      .map(hunkText => ({ diff: hunkText, diffHeader, uri, section }));
  }

  public static parseMergeStatus(mergeHashes: string, mergeMessage: string): MagitMergingState | undefined {

    const mergingBranches = mergeMessage.match(/'(.*?)'/g)
      ?.map(b => b.slice(1, b.length - 1));

    const commits = mergeHashes
      .replace(Constants.FinalLineBreakRegex, '')
      .split(Constants.LineSplitterRegex)
      .map(c => ({ hash: c, message: '', parents: [] }));

    if (mergingBranches) {
      return { commits, mergingBranches };
    }
  }

  public static parseRevListLeftRight(revList: string): [string[], string[]] {

    const left: string[] = [], right: string[] = [];

    revList
      .replace(Constants.FinalLineBreakRegex, '')
      .split(Constants.LineSplitterRegex)
      .forEach(line => {
        switch (line.charAt(0)) {
          case '<':
            left.push(line.slice(1));
            break;
          case '>':
            right.push(line.slice(1));
            break;
          default:
            break;
        }
      });
    return [left, right];
  }

  public static shortHash(hash?: string): string {
    return hash ? hash.slice(0, 7) : '';
  }

  public static shortCommitMessage(commitMessage?: string): string {
    return commitMessage ? commitMessage.split('\n')[0] : '';
  }

  public static changeHunkToPatch(changeHunk: MagitChangeHunk): string {
    return changeHunk.diffHeader + changeHunk.diff + '\n';
  }
}