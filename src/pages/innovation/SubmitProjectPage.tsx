import React from 'react';
import { ProjectSubmissionProvider } from '@/components/project-submission/ProjectSubmissionContext';
import { ProjectSubmissionStepper } from '@/components/project-submission/ProjectSubmissionStepper';

export default function SubmitProjectPage() {
  return (
    <ProjectSubmissionProvider>
      <ProjectSubmissionStepper />
    </ProjectSubmissionProvider>
  );
}
