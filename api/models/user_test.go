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
		users, err := models.GetAllUsers()
		require.Nil(t, err)
		assert.Equal(t, 5, len(users))
	})

	t.Run("Test create user", func(t *testing.T) {
		user := models.User{
			Email:    "test@user-create.com",
			Password: []byte("12345678"),
		}
		result, err := models.CreateUser(&user)
		require.Nil(t, err)

		assert.Equal(t, result.Email, user.Email, "Expected to have equal names, got %v - %v", result.Email, user.Email)
		assert.Equal(t, result.Status, "pending")
		assert.Equal(t, result.Name, "Anonymous User")
	})

	t.Run("Test get user with syllabi and collections", func(t *testing.T) {
		user, err := models.GetUser(userID)
		require.Nil(t, err)
		assert.Equal(t, user.Name, userName)
		assert.Equal(t, 2, len(user.Syllabi))
		assert.Equal(t, 1, len(user.Collections))
	})

	t.Run("Test get user by email", func(t *testing.T) {
		user, err := models.GetUserByEmail(userEmail)
		require.Nil(t, err)
		assert.Equal(t, user.Email, userEmail)
		assert.Equal(t, user.Name, userName)
	})

	t.Run("Test get non-existing user", func(t *testing.T) {
		user, err := models.GetUser(userUnknownID)
		require.NotNil(t, err)
		assert.True(t, user.CreatedAt.IsZero())
	})

	t.Run("Test update user", func(t *testing.T) {
		user, err := models.GetUser(userID)
		require.Nil(t, err)

		user.Email = "test@updated.com"
		updated, err := models.UpdateUser(userID, userID, &user)

		require.Nil(t, err)
		require.False(t, updated.CreatedAt.IsZero())
		assert.Equal(t, user.Email, updated.Email)
		assert.Equal(t, user.Name, userName)
	})

	t.Run("Test update user non-owner", func(t *testing.T) {
		user, err := models.GetUser(userID)
		require.Nil(t, err)

		user.Email = "test@updated.com"
		_, err = models.UpdateUser(userID, userUnknownID, &user)

		require.NotNil(t, err)
	})

	t.Run("Test update non-existing user", func(t *testing.T) {
		user := models.User{
			Email: "test@user-non-existing.updated",
		}
		updated, err := models.UpdateUser(userUnknownID, userID, &user)
		assert.NotNil(t, err)
		assert.Equal(t, uuid.Nil, updated.UUID)
	})

	var newInstID uuid.UUID
	t.Run("Test add institution to user", func(t *testing.T) {
		inst := models.Institution{
			Name:     "Test Uni 2",
			Country:  275,
			Position: "lector",
		}

		updated, err := models.AddInstitutionToUser(userID, userID, &inst)
		require.Nil(t, err)
		assert.Equal(t, userID, updated.UUID)
		assert.Equal(t, 2, len(updated.Institutions))
		newInstID = updated.Institutions[0].UUID
	})

	t.Run("Test remove institution from user", func(t *testing.T) {
		updated, err := models.RemoveInstitutionFromUser(userID, newInstID, userID)
		require.Nil(t, err)
		assert.Equal(t, userID, updated.UUID)
	})

	t.Run("Test delete user", func(t *testing.T) {
		user, err := models.DeleteUser(userDeleteID, userDeleteID)
		assert.Nil(t, err)
		assert.Equal(t, user.Name, userDeleteName)
	})

	t.Run("Test delete wrong user", func(t *testing.T) {
		user, err := models.DeleteUser(userUnknownID, userID)
		assert.Zero(t, user)
		assert.NotNil(t, err)
	})
}
