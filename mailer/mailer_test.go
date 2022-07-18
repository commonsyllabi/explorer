package mailer

import (
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func TestMailer(t *testing.T) {
	gin.SetMode(gin.TestMode)

	t.Run("Testing basic send", func(t *testing.T) {
		err := SendMail("pierre.depaz@gmail.com", "test subject", "")
		assert.Nil(t, err)
	})
}
