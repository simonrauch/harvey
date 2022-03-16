import { createReadlineInterface } from '.';
import { HarvestProjectTaskAssignment } from '../../business/harvest';
import { printMessage } from '../cli-output';

export async function askToChooseTaskProjectAssignmentForAliasing(
  projectTaskAssignments: HarvestProjectTaskAssignment[],
): Promise<HarvestProjectTaskAssignment> {
  return new Promise((resolve) => {
    const rl = createReadlineInterface();
    rl.question('Please choose one, by entering the according number: ', function (numberEntered: string) {
      rl.close();
      const index = Number(numberEntered);
      if (isNaN(index)) {
        printMessage(`${index} is not a number. Please try again.`);
        askToChooseTaskProjectAssignmentForAliasing(projectTaskAssignments).then(resolve);
      } else if (!projectTaskAssignments[index]) {
        printMessage(`${index} is not a valid option. Please try again.`);
        askToChooseTaskProjectAssignmentForAliasing(projectTaskAssignments).then(resolve);
      } else {
        resolve(projectTaskAssignments[index]);
      }
    });
  });
}
