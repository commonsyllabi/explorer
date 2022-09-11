package mailer

import (
	"context"
	"fmt"
	"html/template"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/mailgun/mailgun-go/v4"
)

const DOMAIN = "mail.common-syllabi.org"

type Payload interface {
	Check() error
	Data() interface{}
}

type ConfirmationPayload struct {
	Name  string
	Host  string
	Token string
}

func (c ConfirmationPayload) Check() error {
	var err error
	if c.Name == "" || c.Host == "" || c.Token == "" {
		err = fmt.Errorf("the payload should not be empty")
	}
	return err
}

func (c ConfirmationPayload) Data() interface{} {
	return c
}

type DeletionPayload struct {
	Name string
}

func (c DeletionPayload) Check() error {
	var err error
	if c.Name == "" {
		err = fmt.Errorf("the payload should not be empty")
	}
	return err
}

func (c DeletionPayload) Data() interface{} {
	return c
}

func loadTemplate(_name string, _data interface{}) (string, error) {
	p := filepath.Join("./templates", fmt.Sprintf("%s.tmpl", _name))
	t, err := template.ParseFiles(p)

	if err != nil {
		return "", err
	}

	var body strings.Builder
	err = t.Execute(&body, _data)
	return body.String(), err
}

func SendMail(_dest string, _subject string, _template string, _data Payload) error {
	var err error
	if os.Getenv("API_MODE") == "test" {
		os.Setenv("MAILGUN_PRIVATE_API_KEY", "pubkey-9e6707d57ed1aab274ac62786539c158")
	}
	mg := mailgun.NewMailgun(DOMAIN, os.Getenv("MAILGUN_PRIVATE_API_KEY"))
	mg.SetAPIBase(mailgun.APIBaseEU) //-- rgpd mon amour

	sender := "Common Syllabi <cosyl@mail.common-syllabi.org>"
	subject := _subject
	recipient := _dest
	message := mg.NewMessage(sender, subject, "", recipient)

	err = _data.Check()
	if err != nil {
		return err
	}

	body, err := loadTemplate(_template, _data.Data())
	if err != nil {
		return err
	}
	message.SetHtml(body)

	ctx, cancel := context.WithTimeout(context.Background(), time.Second*10)
	defer cancel()

	if os.Getenv("API_MODE") != "test" {
		_, _, err = mg.Send(ctx, message)
	}

	return err
}
