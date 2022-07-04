package logger

import "testing"

func TestInitLog(t *testing.T) {
	for i := 0; i <= 5; i++ {
		err := InitLog(i)

		if err != nil {
			t.Errorf(err.Error())
		}
	}
}

func TestInitLogError(t *testing.T) {
	err := InitLog(-1)

	if err == nil {
		t.Errorf("expecting log to fail with value %d, got %v", -1, err)
	}
}
