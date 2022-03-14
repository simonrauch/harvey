import { HarvestProjectTaskAssignment } from 'node-harvest-api';
import { createReadlineInterface } from '.';

export async function askToChooseTaskProjectAssignmentForAliasing(
  projectTaskAssignments: HarvestProjectTaskAssignment[],
): Promise<HarvestProjectTaskAssignment> {
  return new Promise((resolve) => {
    const rl = createReadlineInterface();
    rl.question('Please choose one, by entering the according number: ', function (numberEntered: string) {
      rl.close();
      const index = Number(numberEntered);
      if (isNaN(index)) {
        process.stdout.write(`${index} is not a number. Please try again.\n`);
        askToChooseTaskProjectAssignmentForAliasing(projectTaskAssignments).then(resolve);
      } else if (!projectTaskAssignments[index]) {
        process.stdout.write(`${index} is not a valid option. Please try again.\n`);
        askToChooseTaskProjectAssignmentForAliasing(projectTaskAssignments).then(resolve);
      } else {
        resolve(projectTaskAssignments[index]);
      }
    });
  });
}
