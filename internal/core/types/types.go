package types

import (
	"context"
	"errors"
	"math/big"

	"github.com/ethereum/go-ethereum/accounts"
	"github.com/ethereum/go-ethereum/common"
	"github.com/valist-io/registry/internal/contract/registry"
	"github.com/valist-io/registry/internal/contract/valist"
	"github.com/valist-io/registry/internal/storage"
)

const (
	ProjectTypeBinary = "binary"
	ProjectTypeNode   = "node"
	ProjectTypeNPM    = "npm"
	ProjectTypeGo     = "go"
	ProjectTypeRust   = "rust"
	ProjectTypePython = "python"
	ProjectTypeDocker = "docker"
	ProjectTypeCPP    = "c++"
	ProjectTypeStatic = "static"
)

var ProjectTypes = []string{
	ProjectTypeBinary,
	ProjectTypeNode,
	ProjectTypeNPM,
	ProjectTypeGo,
	ProjectTypeRust,
	ProjectTypePython,
	ProjectTypeDocker,
	ProjectTypeCPP,
	ProjectTypeStatic,
}

var (
	ErrOrganizationNotExist = errors.New("Organization does not exist")
	ErrRepositoryNotExist   = errors.New("Repository does not exist")
	ErrReleaseNotExist      = errors.New("Release does not exist")
)

// CoreAPI defines the high-level interface for Valist.
type CoreAPI interface {
	OrganizationAPI
	RegistryAPI
	ReleaseAPI
	RepositoryAPI
	// SetAccount sets the current account.
	SetAccount(accounts.Account)
	// ResolvePath resolves the organization, repository, release, and node from the given path.
	ResolvePath(context.Context, string) (*ResolvedPath, error)
	// Storage returns the underlying storage implementation.
	Storage() storage.Storage
}

type OrganizationAPI interface {
	GetOrganization(context.Context, common.Hash) (*Organization, error)
	GetOrganizationMeta(context.Context, string) (*OrganizationMeta, error)
	CreateOrganization(context.Context, *OrganizationMeta) (*valist.ValistOrgCreated, error)
	VoteOrganizationAdmin(context.Context, common.Hash, common.Hash, common.Address) (*valist.ValistVoteKeyEvent, error)
	VoteOrganizationThreshold(context.Context, common.Hash, *big.Int) (*valist.ValistVoteThresholdEvent, error)
}

type RegistryAPI interface {
	GetOrganizationID(context.Context, string) (common.Hash, error)
	LinkOrganizationName(context.Context, common.Hash, string) (*registry.ValistRegistryMappingEvent, error)
}

type ReleaseAPI interface {
	GetRelease(context.Context, common.Hash, string, string) (*Release, error)
	GetLatestRelease(context.Context, common.Hash, string) (*Release, error)
	ListReleaseTags(common.Hash, string, *big.Int, *big.Int) ReleaseTagIterator
	ListReleases(common.Hash, string, *big.Int, *big.Int) ReleaseIterator
	VoteRelease(context.Context, common.Hash, string, *Release) (*valist.ValistVoteReleaseEvent, error)
}

type RepositoryAPI interface {
	GetRepository(context.Context, common.Hash, string) (*Repository, error)
	GetRepositoryMeta(context.Context, string) (*RepositoryMeta, error)
	CreateRepository(context.Context, common.Hash, string, *RepositoryMeta) (*valist.ValistRepoCreated, error)
	SetRepositoryMeta(context.Context, common.Hash, string, *RepositoryMeta) (*valist.ValistMetaUpdate, error)
	VoteRepoDev(context.Context, common.Hash, string, common.Hash, common.Address) (*valist.ValistVoteKeyEvent, error)
	VoteRepositoryThreshold(context.Context, common.Hash, string, *big.Int) (*valist.ValistVoteThresholdEvent, error)
}

type ReleaseTagIterator interface {
	Next(context.Context) (string, error)
}

type ReleaseIterator interface {
	Next(context.Context) (*Release, error)
	ForEach(context.Context, func(*Release)) error
}

type Organization struct {
	ID            common.Hash
	Threshold     *big.Int
	ThresholdDate *big.Int
	MetaCID       string
}

type OrganizationMeta struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	Homepage    string `json:"homepage"`
}

type LinkOrgNameResult struct {
	OrgID common.Hash
	Name  string
	Err   error
}

type Release struct {
	Tag        string
	ReleaseCID string
	MetaCID    string
	Signers    []common.Address
}

type Repository struct {
	Name          string
	OrgID         common.Hash
	Threshold     *big.Int
	ThresholdDate *big.Int
	MetaCID       string
}

type RepositoryMeta struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	ProjectType string `json:"projectType"`
	Homepage    string `json:"homepage"`
	Repository  string `json:"repository"`
}

type ResolvedPath struct {
	Organization *Organization
	Repository   *Repository
	Release      *Release
	File         storage.File
}
