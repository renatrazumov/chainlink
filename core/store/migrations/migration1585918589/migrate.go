package migration1581240419

import (
	"github.com/jinzhu/gorm"
)

// Migrate creates and optimises table indexes
func Migrate(tx *gorm.DB) error {
	// I can't believe we were missing this one
	// Need `if not exists` because I created it manually on the kovan util node
	err := tx.Exec(`
	CREATE INDEX IF NOT EXISTS idx_task_runs_job_run_id ON task_runs(job_run_id);
	`)
	if err != nil {
		return err
	}

	// The vast majority of runs are completed so there is no point in indexing those ones.
	// We can greatly reduce the size of the index by excluding this status
	err := tx.Exec(`
	DROP INDEX idx_job_runs_status;
	CREATE INDEX idx_job_runs_status ON job_runs(status) WHERE status != "completed";
	`).Error
	if err != nil {
		return err
	}

	// Brin indexes offer much more efficient storage for time series data on large tables
	err := tx.Exec(`
	DROP INDEX idx_task_runs_created_at;
	CREATE INDEX idx_task_runs_created_at ON task_runs USING BRIN (created_at);

	DROP INDEX idx_job_runs_created_at;
	CREATE INDEX idx_job_runs_created_at ON job_runs USING BRIN (created_at);

	DROP INDEX idx_job_runs_deleted_at;
	CREATE INDEX idx_job_runs_deleted_at ON job_runs USING BRIN (deleted_at);

	DROP INDEX idx_tx_attempts_created_at;
	CREATE INDEX idx_tx_attempts_created_at ON tx_attempts USING BRIN (created_at);

	CREATE INDEX idx_run_requests_created_at ON run_requests USING BRIN (created_at);
	`)

	return nil
}
