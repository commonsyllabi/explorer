package mailer

import (
	"os"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestMailer(t *testing.T) {
	os.Setenv("API_MODE", "test")
	t.Run("Testing basic send", func(t *testing.T) {
		err := SendMail("pierre.depaz@gmail.com", "test subject", "test body")

		assert.Nil(t, err)
	})
}
