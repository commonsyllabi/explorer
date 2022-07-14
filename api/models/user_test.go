package models_test

import (
	"fmt"
	"testing"
	"time"

	"github.com/commonsyllabi/explorer/api/models"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

var (
	userID      int64 = 1
	userWrongID int64 = 2046
)

func TestUserModel(t *testing.T) {
	teardown := setup(t)
	defer teardown(t)

	t.Run("Test get all users", func(t *testing.T) {
		user, err := models.GetAllUsers()
		require.Nil(t, err)
		assert.NotEqual(t, len(user), 0)
	})

	t.Run("Test create user", func(t *testing.T) {
		user := models.User{
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
			Email:     "test@user.com",
			Password:  []byte("12345678"),
		}
		u, err := models.CreateUser(&user)
		require.Nil(t, err)

		assert.Equal(t, u.Email, user.Email, "Expected to have equal names, got %v - %v", u.Email, user.Email)
	})

	t.Run("Test get user", func(t *testing.T) {
		user, err := models.GetUser(userID)
		require.Nil(t, err)
		assert.Equal(t, user.ID, userID)
	})

	t.Run("Test get user with syllabus", func(t *testing.T) {
		user, err := models.GetUser(userID)
		require.Nil(t, err)
		assert.Equal(t, 1, len(user.Syllabi))
	})

	t.Run("Test get non-existing user", func(t *testing.T) {
		user, err := models.GetUser(userWrongID)
		assert.NotNil(t, err)
		assert.True(t, user.CreatedAt.IsZero())
	})

	t.Run("Test update user", func(t *testing.T) {
		user := models.User{
			UpdatedAt: time.Now(),
			Email:     "test@user.updated",
		}
		updated, err := models.UpdateUser(userID, &user)
		require.Nil(t, err)
		require.False(t, updated.CreatedAt.IsZero())

		assert.Equal(t, updated.Email, user.Email)
		assert.NotEqual(t, updated.CreatedAt, updated.UpdatedAt, "Expected the CreatedAt and the UpdatedAt values to be different")
	})

	t.Run("Test update non-existing user", func(t *testing.T) {
		user := models.User{
			UpdatedAt: time.Now(),
			Email:     "test@user.updated",
		}
		updated, err := models.UpdateUser(userWrongID, &user)
		assert.NotNil(t, err)
		assert.True(t, updated.CreatedAt.IsZero())
	})

	t.Run("Test delete user", func(t *testing.T) {
		err := models.DeleteUser(userID)
		assert.Nil(t, err)
	})

	t.Run("Test delete wrong user", func(t *testing.T) {
		err := models.DeleteUser(userWrongID)
		fmt.Println(err)
		assert.NotNil(t, err)
	})
}
