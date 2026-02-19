export interface PatientData {
  condition: string;
  age: number | null;
  gender: string | null;
}

export interface ClinicalTrialStudy {
  protocolSection: {
    identificationModule: {
      nctId: string;
      briefTitle: string;
    };
    statusModule: {
      overallStatus: string;
    };
    conditionsModule?: {
      conditions?: string[];
    };
    eligibilityModule?: {
      eligibilityCriteria?: string;
      sex?: string;
      minimumAge?: string;
      maximumAge?: string;
    };
  };
}

export interface ClinicalTrialsResponse {
  studies: ClinicalTrialStudy[];
  nextPageToken?: string;
}

export interface TrialCardProps {
  nctId: string;
  title: string;
  status: string;
  conditions: string[];
  eligibilityCriteria?: string;
}
