public class test{
    public static void main(String[] args) {
        int x = 0;
        for (int j = 0; j < 10; j++) {
            for(int i = 1; i <= j; i++){
                x++;
            }
            System.out.println(x);
        }
    }
}