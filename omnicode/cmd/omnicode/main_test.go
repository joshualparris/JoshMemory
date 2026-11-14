package main

import (
	"context"
	"strings"
	"testing"
)

func TestAudit(t *testing.T) {
	result, err := audit(context.Background(), "  Alex@Example.COM  ")
	if err != nil {
		t.Fatal(err)
	}
	if result.Email != "alex@example.com" || result.Domain != "example.com" || result.Masked != "a***@example.com" || result.TLD != "com" || result.Marker != "TLD-COM" || result.LanguagesExecuted != 9 {
		t.Fatalf("unexpected result: %+v", result)
	}
	if len(result.Fingerprint) != 16 || len(result.Checksum) != 8 {
		t.Fatal("invalid hashes")
	}
}
func TestAuditInvalid(t *testing.T) {
	for _, email := range []string{"bad", "", "test@@example.com", "a..b@example.com", strings.Repeat("a", 260) + "@example.com"} {
		if _, err := audit(context.Background(), email); err == nil {
			t.Errorf("accepted invalid email %q", email)
		}
	}
}
