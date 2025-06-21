export type Names = {id: number;
    number: number;
    arabic: string ; // Union Type
    transliteration: string;
    meaning: string;
    details: string;
    urdu: string;
    urduMeaning:string;
    urduExplanation:string;
    
  };
  

  export type Story = {
    id: number;
    title: string;
    content: string;
    contentUrdu: string;
    titleUrdu: string;
    message: string;
    messageUrdu: string;
    image: string;
    backimage: string;
    audio: string ; 
    audioUrdu: string ; 
    type: string ; 
  }
  


export type Kalma = {
  id: number;
  title: string;
  text: string;
};


export type Dua = {
  arabic: string;
  id: number;
  translation: string;
};

// Props for the category and corresponding duas
export type DuaCategoryProps = {
  category: string;
  duas: Dua[];
};




