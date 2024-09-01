

public class HashTagTokenizer {

	public static void main(String[] args) {

		String hashTag = args[0];
		String []dictionary = readDictionary("dictionary.txt");
		breakHashTag(hashTag, dictionary);
	}

	/* The function gets a file name, read all of it and puts all the words inside into array and returns it */
	public static String[] readDictionary(String fileName) {
		String[] dictionary = new String[3000];

		In in = new In(fileName);

		for (int i = 0; i < dictionary.length; i++) {
			String word = in.readLine(); // Read a word from the file
			dictionary [i] = word; // Puts the value into the variable
		}

		return dictionary;
	}

	/* The function gets a word and check if the word is the dictionart array and returns true if it's inside and false if not  */
	public static boolean existInDictionary (String word, String [] dictionary) {
		for (String wordFromTheDictionary: dictionary) { // The loop goes through the array and check if the word is in the dictionary
			if (wordFromTheDictionary.equals(word)) { // and return true if it's true
				return true;
			}
		}
		return false;
	}

	public static void breakHashTag(String hashtag, String[] dictionary) {

		// Base case: do nothing (return) if hashtag is an empty string.
        if (hashtag.isEmpty()) {
            return;
        }
		
		hashtag = hashtag.toLowerCase();
        int N = hashtag.length();

        for (int i = 1; i <= N; i++) {
			String str = hashtag.substring(0, i);
			if (existInDictionary(str, dictionary)) {
				System.out.println(str);
				breakHashTag(hashtag.substring(i), dictionary);
				return;
			}
        }
    }
}
