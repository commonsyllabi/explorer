package models_test

import (
	"testing"

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
			Email:    "test@user-create.com",
			Password: []byte("12345678"),
		}
		u, err := models.CreateUser(&user)
		require.Nil(t, err)

		assert.Equal(t, u.Email, user.Email, "Expected to have equal names, got %v - %v", u.Email, user.Email)
	})

	t.Run("Test get user", func(t *testing.T) {
		user, err := models.GetUser(userID)
		require.Nil(t, err)
		assert.Equal(t, user.UUID, userID)
	})

	t.Run("Test get user with syllabus", func(t *testing.T) {
		user, err := models.GetUser(userID)
		require.Nil(t, err)
		assert.Equal(t, 2, len(user.Syllabi))
	})

	t.Run("Test get non-existing user", func(t *testing.T) {
		user, err := models.GetUser(userNonExistentID)
		require.NotNil(t, err)
		assert.True(t, user.CreatedAt.IsZero())
	})

	t.Run("Test update user", func(t *testing.T) {
		user, err := models.GetUser(userID)
		require.Nil(t, err)

		user.Email = "test@updated.com"
		updated, err := models.UpdateUser(userID, &user)

		require.Nil(t, err)
		require.False(t, updated.CreatedAt.IsZero())
		assert.Equal(t, user.Email, updated.Email)
	})

	t.Run("Test update non-existing user", func(t *testing.T) {
		user := models.User{
			Email: "test@user-non-existing.updated",
		}
		updated, err := models.UpdateUser(userNonExistentID, &user)
		assert.NotNil(t, err)
		assert.Equal(t, uuid.Nil, updated.UUID)
	})

	t.Run("Test delete user", func(t *testing.T) {
		user, err := models.DeleteUser(userDeleteID)
		assert.Nil(t, err)
		assert.NotNil(t, user)
	})

	t.Run("Test delete wrong user", func(t *testing.T) {
		user, err := models.DeleteUser(userNonExistentID)
		assert.Zero(t, user)
		assert.NotNil(t, err)
	})
}
