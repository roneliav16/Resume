import java.io.File;
import java.io.IOException;

public class Main {
    public static void main(String[] args) {
        String path = args[0];
        File source_file = new File(path);
        String abs = source_file.getAbsolutePath();

        try {
            HackAssembler h = new HackAssembler(abs);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
}
