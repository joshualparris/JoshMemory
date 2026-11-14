import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;

public final class Domain {
    public static void main(String[] args) throws Exception {
        BufferedReader reader = new BufferedReader(new InputStreamReader(System.in, StandardCharsets.UTF_8));
        String email = reader.readLine();
        if (email == null || email.indexOf('@') < 1) System.exit(1);
        System.out.println(email.substring(email.indexOf('@') + 1));
    }
}
