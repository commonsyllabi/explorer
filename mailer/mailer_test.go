package mailer

import (
	"os"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestMailer(t *testing.T) {
	os.Setenv("API_MODE", "test")
	t.Run("Testing basic send", func(t *testing.T) {
		htmlBody := `
		<html>
		<body>
		<h1>test</h1>
		</body>
		</html>`

		err := SendMail("pierre.depaz@gmail.com", "test subject", htmlBody)

		assert.Nil(t, err)
	})
}
