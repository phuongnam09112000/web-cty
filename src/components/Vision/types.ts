export interface VisionMissionData {
    title: string;
    sections: {
      subTitle: string;
      content: string[];
    }[];
  }
  
 export interface AnimatedProps {
    visible: boolean;
  }
  
export interface TextContainerProps extends AnimatedProps {
    textVisible: boolean;
  }