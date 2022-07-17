package models_test

import (
	"testing"
	"time"

	"github.com/commonsyllabi/explorer/api/models"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
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
			Email:     "test@user-create.com",
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
		user, err := models.GetUser(userNonExistentID)
		assert.NotNil(t, err)
		assert.True(t, user.CreatedAt.IsZero())
	})

	t.Run("Test update user", func(t *testing.T) {
		user, err := models.GetUser(userID)
		if err != nil {
			t.Error(err)
		}
		user.Email = "test@user.updated"
		var other models.User
		other.Email = "other@updated.com"

		updated, err := models.UpdateUser(userID, &other)

		require.Nil(t, err)
		require.False(t, updated.CreatedAt.IsZero())
		assert.Equal(t, other.Email, updated.Email)
	})

	t.Run("Test update non-existing user", func(t *testing.T) {
		user := models.User{
			UpdatedAt: time.Now(),
			Email:     "test@user.updated",
		}
		updated, err := models.UpdateUser(userNonExistentID, &user)
		assert.NotNil(t, err)
		assert.Equal(t, uuid.Nil, updated.ID)
	})

	t.Run("Test delete user", func(t *testing.T) {
		user, err := models.DeleteUser(userID)
		assert.NotNil(t, user)
		assert.Nil(t, err)
	})

	t.Run("Test delete wrong user", func(t *testing.T) {
		user, err := models.DeleteUser(userNonExistentID)
		assert.Zero(t, user)
		assert.NotNil(t, err)
	})
}
