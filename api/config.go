package api

import (
	"io/ioutil"
	"os"
	"path/filepath"

	"gopkg.in/yaml.v2"
)

// Config holds port numbers, target directories
type Config struct {
	PublicDir    string `yaml:"publicDir"`
	TemplatesDir string `yaml:"templatesDir"`
	FixturesDir  string `yaml:"FixturesDir"`
}

// DefaultConf is called if there is an error opening and parsing the config file
func (c *Config) DefaultConf() {
	c.PublicDir = "./www/public"
	c.TemplatesDir = "./api/templates"
}

// LoadConf tries to load a yaml file from disk, and marshals it. Sensible defaults are provided, and loading a file overrides them
func (c *Config) LoadConf(path string) error {
	cwd, _ := os.Getwd()
	content, err := ioutil.ReadFile(filepath.Join(cwd, path))
	if err != nil {
		c.DefaultConf()
		return err
	}

	err = yaml.Unmarshal(content, &c)
	if err != nil {
		c.DefaultConf()
		return err
	}
	return nil
}
