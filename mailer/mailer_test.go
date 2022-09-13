package mailer

import (
	"os"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestMailer(t *testing.T) {
	os.Setenv("API_MODE", "test")

	t.Run("Testing basic send", func(t *testing.T) {
		body := ConfirmationPayload{
			Name:  "Pierre",
			Host:  "localhost",
			Token: "ttttt-oooo-kkkk-eeeee",
		}

		err := SendMail("pierre.depaz@gmail.com", "test subject", "account_confirmation", body)

		assert.Nil(t, err)
	})

	t.Run("Testing wrong template", func(t *testing.T) {
		body := ConfirmationPayload{
			Name:  "Pierre",
			Host:  "localhost",
			Token: "ttttt-oooo-kkkk-eeeee",
		}

		err := SendMail("pierre.depaz@gmail.com", "test subject", "does not exist", body)

		assert.NotNil(t, err)
	})

	t.Run("Testing empty send", func(t *testing.T) {
		body := ConfirmationPayload{}

		err := SendMail("pierre.depaz@gmail.com", "test subject", "account_confirmation", body)

		assert.NotNil(t, err)
	})
}
