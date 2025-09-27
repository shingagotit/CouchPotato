import { NetflixButton } from './netflix-button';

interface AlphabetNavigatorProps {
  availableLetters: string[];
  selectedLetter: string;
  onLetterSelect: (letter: string) => void;
}

const AlphabetNavigator = ({ 
  availableLetters, 
  selectedLetter, 
  onLetterSelect 
}: AlphabetNavigatorProps) => {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  return (
    <div className="flex flex-col gap-1 px-4 py-6 bg-muted/20 border-r border-border min-h-screen">
      <h3 className="text-sm font-semibold text-muted-foreground mb-4 px-2">
        Quick Jump
      </h3>
      
      {alphabet.map((letter) => {
        const isAvailable = availableLetters.includes(letter);
        const isSelected = selectedLetter === letter;
        
        return (
          <NetflixButton
            key={letter}
            variant={isSelected ? "default" : "ghost"}
            size="sm"
            onClick={() => isAvailable && onLetterSelect(letter)}
            disabled={!isAvailable}
            className={`
              w-10 h-10 p-0 rounded-md transition-smooth text-sm font-medium
              ${isSelected 
                ? 'bg-primary text-primary-foreground shadow-glow' 
                : isAvailable 
                  ? 'text-foreground hover:bg-primary/20 hover:text-primary' 
                  : 'text-muted-foreground/50 cursor-not-allowed'
              }
            `}
          >
            {letter}
          </NetflixButton>
        );
      })}
      
      <div className="mt-4 px-2 text-xs text-muted-foreground">
        <div className="bg-primary/20 w-3 h-3 rounded-sm inline-block mr-2" />
        Available
      </div>
    </div>
  );
};

export default AlphabetNavigator;