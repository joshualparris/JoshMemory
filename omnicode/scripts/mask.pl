use strict;
use warnings;
my $email = <STDIN> // die "empty input";
chomp $email;
my ($local, $domain) = split(/\@/, $email, 2);
die "invalid email" unless defined($domain) && length($local);
print substr($local, 0, 1) . (length($local) > 1 ? '***' : '') . '@' . $domain . "\n";
