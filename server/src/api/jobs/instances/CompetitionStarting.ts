import { onCompetitionStarting } from '../../events/competition.events';
import * as competitionService from '../../services/internal/competition.service';
import { Job } from '../index';

class CompetitionStarting implements Job {
  name: string;

  constructor() {
    this.name = 'CompetitionStarting';
  }

  async handle(data: any): Promise<void> {
    const { competitionId, minutes } = data;

    const competition = await competitionService.resolve(competitionId, { includeGroup: true });

    if (!competition) return;

    // Double check the competition is starting, since the
    // competition start date can be changed between the
    // scheduling and execution of this job
    if (Math.abs(Date.now() - (competition.startsAt.getTime() - minutes * 60 * 1000)) > 10000) {
      return;
    }

    const competitionDetails = await competitionService.getDetails(competition);
    const period = minutes < 60 ? { minutes } : { hours: minutes / 60 };
    onCompetitionStarting(competitionDetails, period);
  }
}

export default new CompetitionStarting();
