import java.util.HashMap;
import java.util.Random;

public class LanguageModel {

    // The map of this model.
    // Maps windows to lists of charachter data objects.
    HashMap<String, List> CharDataMap;
    
    // The window length used in this model.
    int windowLength;
    
    // The random number generator used by this model. 
	private Random randomGenerator;

    /** Constructs a language model with the given window length and a given
     *  seed value. Generating texts from this model multiple times with the 
     *  same seed value will produce the same random texts. Good for debugging. */
    public LanguageModel(int windowLength, int seed) {
        this.windowLength = windowLength;
        randomGenerator = new Random(seed);
        CharDataMap = new HashMap<String, List>();
    }

    /** Constructs a language model with the given window length.
     * Generating texts from this model multiple times will produce
     * different random texts. Good for production. */
    public LanguageModel(int windowLength) {
        this.windowLength = windowLength;
        randomGenerator = new Random();
        CharDataMap = new HashMap<String, List>();
    }

    /** Builds a language model from the text in the given file (the corpus). */
	public void train(String fileName) {
        String window = "";
        char c;
        In in = new In(fileName);
        // Reads just enough characters to form the first window
        
        for (int i = 0; i < windowLength; i++) {
            char temp = in.readChar();
            window += temp;
        }
        // Processes the entire text, one character at a time
        while (!in.isEmpty()) {
        // Gets the next character
        c = in.readChar();

        List probs = CharDataMap.get(window);
        // Checks if the window is already in the map
        if (probs == null) {
        // Creates a new empty list, and adds (window,list) to the map
        probs = new List();
        CharDataMap.put(window, probs);
        }

        // Calculates the counts of the current character.
        probs.update(c);
        // Advances the window: adds c to the window’s end, and deletes the
        // window's first character.
        window = window.substring(1) + c;
        }
        // The entire file has been processed, and all the characters have been counted.
        // Proceeds to compute and set the p and cp fields of all the CharData objects
        // in each linked list in the map.
        for (List probs : CharDataMap.values())
            calculateProbabilities(probs);
        }

    // Computes and sets the probabilities (p and cp fields) of all the
	// characters in the given list. */
	public void calculateProbabilities(List probs) {
        ListIterator lIterator = probs.listIterator(0);			
        int countCharacters = 0;
        while (lIterator.hasNext()) {
            countCharacters += lIterator.current.cp.count;
            lIterator.next();
        }

        lIterator = probs.listIterator(0);			
        double cumulativePrev = 0;
        while (lIterator.hasNext()) {
            lIterator.current.cp.p = (double) lIterator.current.cp.count / countCharacters;
            lIterator.current.cp.cp = cumulativePrev + lIterator.current.cp.p;
            cumulativePrev = lIterator.current.cp.cp;
            lIterator.next();
        }
 	}

    // Returns a random character from the given probabilities list.
     public char getRandomChar (List probs) {
        double r = randomGenerator.nextDouble();
        ListIterator listItr = probs.listIterator(0);
        if (listItr.current.cp.cp > r) {
            return listItr.current.cp.chr;
        }
    
        while (listItr.hasNext()) {
            if (listItr.current.cp.cp > r) {
                return listItr.current.cp.chr;
            }
            listItr.next();
        }
        return ' ';
    }

    /**
	 * Generates a random text, based on the probabilities that were learned during training. 
	 * @param initialText - text to start with. If initialText's last substring of size numberOfLetters
	 * doesn't appear as a key in Map, we generate no text and return only the initial text. 
	 * @param numberOfLetters - the size of text to generate
	 * @return the generated text
	 */
	public String generate(String initialText, int textLength) {
        if (initialText.length() < this.windowLength) {
            return initialText;
        }

        String window = initialText.substring(initialText.length() - this.windowLength);

         // Enter the initial String to the generated String.
        String generatedString = window;
        int counter = this.windowLength + textLength;
        // The loop ends when the generated text is equal or bigger the textLength (user choise)
        while (generatedString.length() < counter) { 
            // gets the list of the last 'windowsLength' characters.
            List tempList = CharDataMap.get(window); 
            // if the list is empty - return the generatedString (the string that we  generate so far) if not continue to generate the String.
            if (tempList != null) {
                char c = getRandomChar(tempList);
                generatedString += c;
                window = window.substring(1) + c;
            } else {
                break;
            }

        }
        return generatedString;
	}

    /** Returns a string representing the map of this language model. */
	public String toString() {
		StringBuilder str = new StringBuilder();
		for (String key : CharDataMap.keySet()) {
			List keyProbs = CharDataMap.get(key);
			str.append(key + " : " + keyProbs + "\n");
		}
		return str.toString();
	}

    public static void main(String[] args) {
        int windowLength = Integer.parseInt(args[0]);
        String initialText = args[1];
        int generatedTextLength = Integer.parseInt(args[2]);
        Boolean randomGeneration = args[3].equals("random");
        String fileName = args[4];

        // Create the LanguageModel object
        LanguageModel lm;
        if (randomGeneration)
        lm = new LanguageModel(windowLength);
        else
        lm = new LanguageModel(windowLength, 20);
        // Trains the model, creating the map.
        lm.train(fileName);
        // Generates text, and prints it.
        System.out.println(lm.generate(initialText, generatedTextLength));
    }
}
